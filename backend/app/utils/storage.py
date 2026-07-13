"""File storage abstraction — local filesystem and S3-compatible backends.

Factory function get_storage() returns the appropriate backend based on config.
"""

import logging
import os
from abc import ABC, abstractmethod

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageBackend(ABC):
    """Abstract file storage interface."""

    @abstractmethod
    async def upload_file(self, content: bytes, filename: str, content_type: str) -> str:
        """Upload file and return the storage path."""
        ...

    @abstractmethod
    async def download_file(self, storage_path: str) -> bytes:
        """Download and return file contents."""
        ...

    @abstractmethod
    async def delete_file(self, storage_path: str) -> None:
        """Delete a file from storage."""
        ...


class LocalStorage(StorageBackend):
    """Local filesystem storage backend (development / fallback)."""

    def __init__(self, upload_dir: str | None = None):
        self.upload_dir = upload_dir or settings.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)

    async def upload_file(self, content: bytes, filename: str, content_type: str) -> str:
        """Write file to local uploads directory."""
        filepath = os.path.join(self.upload_dir, filename)
        with open(filepath, "wb") as f:
            f.write(content)
        logger.debug("LocalStorage: saved %s (%d bytes)", filepath, len(content))
        return filepath

    async def download_file(self, storage_path: str) -> bytes:
        """Read file from local uploads directory."""
        if not os.path.exists(storage_path):
            raise FileNotFoundError(f"File not found: {storage_path}")
        with open(storage_path, "rb") as f:
            return f.read()

    async def delete_file(self, storage_path: str) -> None:
        """Remove file from local uploads directory."""
        if os.path.exists(storage_path):
            os.remove(storage_path)
            logger.debug("LocalStorage: deleted %s", storage_path)


class S3Storage(StorageBackend):
    """S3-compatible object storage backend (production)."""

    def __init__(self) -> None:
        kwargs: dict = {
            "region_name": settings.S3_REGION,
        }
        if settings.AWS_ACCESS_KEY_ID:
            kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
        if settings.AWS_SECRET_ACCESS_KEY:
            kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
        if settings.S3_ENDPOINT_URL:
            kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL

        self._client = boto3.client("s3", **kwargs)
        self._bucket = settings.S3_BUCKET_NAME

    async def upload_file(self, content: bytes, filename: str, content_type: str) -> str:
        """Upload file to S3 bucket."""
        key = f"resumes/{filename}"
        try:
            self._client.put_object(
                Bucket=self._bucket,
                Key=key,
                Body=content,
                ContentType=content_type,
            )
            logger.debug("S3Storage: uploaded %s (%d bytes)", key, len(content))
            return key
        except ClientError as e:
            logger.error("S3 upload failed: %s", e)
            raise RuntimeError(f"Failed to upload file to S3: {e}") from e

    async def download_file(self, storage_path: str) -> bytes:
        """Download file from S3 bucket."""
        try:
            response = self._client.get_object(Bucket=self._bucket, Key=storage_path)
            return response["Body"].read()
        except ClientError as e:
            logger.error("S3 download failed: %s", e)
            raise FileNotFoundError(f"File not found in S3: {storage_path}") from e

    async def delete_file(self, storage_path: str) -> None:
        """Delete file from S3 bucket."""
        try:
            self._client.delete_object(Bucket=self._bucket, Key=storage_path)
            logger.debug("S3Storage: deleted %s", storage_path)
        except ClientError as e:
            logger.error("S3 delete failed: %s", e)


_storage_instance: StorageBackend | None = None


def get_storage() -> StorageBackend:
    """Factory that returns the configured storage backend (singleton)."""
    global _storage_instance
    if _storage_instance is None:
        if settings.STORAGE_BACKEND == "s3":
            _storage_instance = S3Storage()
        else:
            _storage_instance = LocalStorage()
        logger.info("Storage backend initialized: %s", settings.STORAGE_BACKEND)
    return _storage_instance

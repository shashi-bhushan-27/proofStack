"""Skill name normalizer — maps common aliases to canonical names.

Contains 150+ real-world skill aliases covering programming languages,
frameworks, databases, cloud services, DevOps tools, and more.
"""


# ── Canonical mapping: alias (lowered) → normalized name ─────────────────
SKILL_ALIASES: dict[str, str] = {
    # Python
    "python": "python", "python3": "python", "python 3": "python", "py": "python",
    "cpython": "python", "python2": "python",
    # JavaScript
    "javascript": "javascript", "js": "javascript", "ecmascript": "javascript",
    "es6": "javascript", "es2015": "javascript", "vanilla js": "javascript",
    "vanilla javascript": "javascript",
    # TypeScript
    "typescript": "typescript", "ts": "typescript",
    # Java
    "java": "java", "java 8": "java", "java 11": "java", "java 17": "java",
    "java se": "java", "java ee": "java", "j2ee": "java",
    # C#
    "c#": "csharp", "csharp": "csharp", "c sharp": "csharp", ".net c#": "csharp",
    # C++
    "c++": "cpp", "cpp": "cpp", "c plus plus": "cpp",
    # C
    "c": "c", "c language": "c", "ansi c": "c",
    # Go
    "go": "golang", "golang": "golang", "go lang": "golang",
    # Rust
    "rust": "rust", "rust lang": "rust", "rustlang": "rust",
    # Ruby
    "ruby": "ruby", "rb": "ruby",
    # PHP
    "php": "php", "php7": "php", "php8": "php",
    # Swift
    "swift": "swift", "swift 5": "swift",
    # Kotlin
    "kotlin": "kotlin", "kt": "kotlin",
    # Scala
    "scala": "scala",
    # R
    "r": "r", "r language": "r", "r programming": "r",
    # SQL
    "sql": "sql", "structured query language": "sql",
    # Shell/Bash
    "bash": "bash", "shell": "bash", "shell scripting": "bash",
    "sh": "bash", "zsh": "bash", "unix shell": "bash",
    # React
    "react": "react", "reactjs": "react", "react.js": "react",
    "react js": "react",
    # Angular
    "angular": "angular", "angularjs": "angular", "angular.js": "angular",
    "angular 2+": "angular", "angular 2": "angular",
    # Vue
    "vue": "vue", "vuejs": "vue", "vue.js": "vue", "vue js": "vue",
    "vue 3": "vue",
    # Next.js
    "next.js": "nextjs", "nextjs": "nextjs", "next js": "nextjs", "next": "nextjs",
    # Svelte
    "svelte": "svelte", "sveltejs": "svelte", "sveltekit": "svelte",
    # Node.js
    "node.js": "nodejs", "nodejs": "nodejs", "node": "nodejs", "node js": "nodejs",
    # Express
    "express": "express", "expressjs": "express", "express.js": "express",
    # Django
    "django": "django", "django rest framework": "django_rest_framework",
    "drf": "django_rest_framework",
    # Flask
    "flask": "flask",
    # FastAPI
    "fastapi": "fastapi", "fast api": "fastapi",
    # Spring
    "spring": "spring", "spring boot": "spring_boot", "springboot": "spring_boot",
    "spring framework": "spring",
    # Rails
    "rails": "ruby_on_rails", "ruby on rails": "ruby_on_rails", "ror": "ruby_on_rails",
    # .NET
    ".net": "dotnet", "dotnet": "dotnet", ".net core": "dotnet_core",
    "asp.net": "aspnet", "asp.net core": "aspnet_core",
    # PostgreSQL
    "postgresql": "postgresql", "postgres": "postgresql", "psql": "postgresql",
    "pg": "postgresql",
    # MySQL
    "mysql": "mysql", "my sql": "mysql", "mariadb": "mysql",
    # MongoDB
    "mongodb": "mongodb", "mongo": "mongodb", "mongo db": "mongodb",
    # Redis
    "redis": "redis",
    # Elasticsearch
    "elasticsearch": "elasticsearch", "elastic search": "elasticsearch",
    "elastic": "elasticsearch", "es": "elasticsearch",
    # SQLite
    "sqlite": "sqlite", "sqlite3": "sqlite",
    # Oracle
    "oracle": "oracle_db", "oracle db": "oracle_db", "oracle database": "oracle_db",
    # SQL Server
    "sql server": "sql_server", "mssql": "sql_server",
    "microsoft sql server": "sql_server", "ms sql": "sql_server",
    # DynamoDB
    "dynamodb": "dynamodb", "dynamo db": "dynamodb", "dynamo": "dynamodb",
    # Cassandra
    "cassandra": "cassandra", "apache cassandra": "cassandra",
    # AWS
    "aws": "aws", "amazon web services": "aws",
    "amazon aws": "aws",
    # EC2
    "ec2": "aws_ec2", "amazon ec2": "aws_ec2", "aws ec2": "aws_ec2",
    # S3
    "s3": "aws_s3", "amazon s3": "aws_s3", "aws s3": "aws_s3",
    # Lambda
    "lambda": "aws_lambda", "aws lambda": "aws_lambda",
    # GCP
    "gcp": "gcp", "google cloud": "gcp", "google cloud platform": "gcp",
    # Azure
    "azure": "azure", "microsoft azure": "azure", "ms azure": "azure",
    # Docker
    "docker": "docker", "docker containers": "docker", "containerization": "docker",
    # Kubernetes
    "kubernetes": "kubernetes", "k8s": "kubernetes", "kube": "kubernetes",
    # Terraform
    "terraform": "terraform", "tf": "terraform", "hashicorp terraform": "terraform",
    # Ansible
    "ansible": "ansible",
    # Jenkins
    "jenkins": "jenkins",
    # GitHub Actions
    "github actions": "github_actions", "gh actions": "github_actions",
    # GitLab CI
    "gitlab ci": "gitlab_ci", "gitlab ci/cd": "gitlab_ci",
    # CI/CD
    "ci/cd": "cicd", "cicd": "cicd", "ci cd": "cicd",
    "continuous integration": "cicd", "continuous deployment": "cicd",
    # Git
    "git": "git", "github": "git", "gitlab": "git", "bitbucket": "git",
    # Linux
    "linux": "linux", "unix": "linux", "ubuntu": "linux", "centos": "linux",
    "debian": "linux",
    # Nginx
    "nginx": "nginx",
    # Apache Kafka
    "kafka": "kafka", "apache kafka": "kafka",
    # RabbitMQ
    "rabbitmq": "rabbitmq", "rabbit mq": "rabbitmq",
    # GraphQL
    "graphql": "graphql", "graph ql": "graphql",
    # REST
    "rest": "rest_api", "rest api": "rest_api", "restful": "rest_api",
    "restful api": "rest_api", "rest apis": "rest_api",
    # gRPC
    "grpc": "grpc", "g-rpc": "grpc",
    # Machine Learning
    "machine learning": "machine_learning", "ml": "machine_learning",
    # Deep Learning
    "deep learning": "deep_learning", "dl": "deep_learning",
    # TensorFlow
    "tensorflow": "tensorflow", "tf": "tensorflow", "tensor flow": "tensorflow",
    # PyTorch
    "pytorch": "pytorch", "torch": "pytorch",
    # NLP
    "nlp": "nlp", "natural language processing": "nlp",
    # Computer Vision
    "computer vision": "computer_vision", "cv": "computer_vision",
    # Scikit-learn
    "scikit-learn": "scikit_learn", "sklearn": "scikit_learn",
    "scikit learn": "scikit_learn",
    # Pandas
    "pandas": "pandas",
    # NumPy
    "numpy": "numpy",
    # Data Science
    "data science": "data_science", "data analytics": "data_science",
    # Agile
    "agile": "agile", "agile methodology": "agile", "scrum": "scrum",
    "kanban": "kanban",
    # Communication
    "communication": "communication", "communication skills": "communication",
    "verbal communication": "communication", "written communication": "communication",
    # Leadership
    "leadership": "leadership", "team leadership": "leadership",
    "team lead": "leadership", "tech lead": "leadership",
    # Problem Solving
    "problem solving": "problem_solving", "problem-solving": "problem_solving",
    "analytical skills": "problem_solving",
    # Teamwork
    "teamwork": "teamwork", "team work": "teamwork", "collaboration": "teamwork",
    "team player": "teamwork",
    # Project Management
    "project management": "project_management", "pm": "project_management",
    "jira": "jira", "confluence": "confluence",
    # Testing
    "testing": "testing", "unit testing": "unit_testing",
    "integration testing": "integration_testing",
    "test driven development": "tdd", "tdd": "tdd",
    "pytest": "pytest", "jest": "jest", "junit": "junit",
    # Microservices
    "microservices": "microservices", "micro services": "microservices",
    "microservice architecture": "microservices",
    # System Design
    "system design": "system_design", "systems design": "system_design",
    "distributed systems": "distributed_systems",
    # HTML/CSS
    "html": "html", "html5": "html",
    "css": "css", "css3": "css",
    "sass": "sass", "scss": "sass", "less": "less",
    # Tailwind
    "tailwind": "tailwind_css", "tailwind css": "tailwind_css",
    "tailwindcss": "tailwind_css",
    # Bootstrap
    "bootstrap": "bootstrap",
    # Webpack
    "webpack": "webpack",
    # Vite
    "vite": "vite",
    # Security
    "security": "security", "cybersecurity": "security",
    "application security": "security", "infosec": "security",
    "oauth": "oauth", "oauth2": "oauth", "jwt": "jwt",
    # Monitoring
    "datadog": "datadog", "prometheus": "prometheus",
    "grafana": "grafana", "new relic": "new_relic",
    "splunk": "splunk",
    # Figma
    "figma": "figma",
    # Tableau
    "tableau": "tableau", "power bi": "power_bi", "powerbi": "power_bi",
}


def normalize_skill(name: str) -> str:
    """Normalize a skill name to its canonical form.

    Falls back to a cleaned-up version of the original name if no alias is found.

    Args:
        name: Raw skill name string.

    Returns:
        Normalized canonical skill name.
    """
    if not name:
        return ""
    cleaned = name.strip().lower()
    if cleaned in SKILL_ALIASES:
        return SKILL_ALIASES[cleaned]
    # Fallback: lowercase, replace spaces/hyphens with underscores
    return cleaned.replace(" ", "_").replace("-", "_")


def normalize_skills(names: list[str]) -> list[str]:
    """Normalize a list of skill names.

    Args:
        names: List of raw skill name strings.

    Returns:
        List of normalized skill names (preserves order, deduplicates).
    """
    seen: set[str] = set()
    result: list[str] = []
    for name in names:
        normalized = normalize_skill(name)
        if normalized and normalized not in seen:
            seen.add(normalized)
            result.append(normalized)
    return result

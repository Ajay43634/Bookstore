from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://bookstore:bookstore@db:5432/bookstore"
    jwt_secret: str = "dev-secret-change-me"
    port: int = 4000

    model_config = {"env_file": ".env"}


settings = Settings()

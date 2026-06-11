from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="backend/.env",
        env_file_encoding="utf-8",
        extra="ignore",
)
    app_name: str = "EventSphere"
    api_v1_prefix: str = "/api/v1"

    database_url: str = Field(
        default="sqlite:///./smart_event.db",
        alias="DATABASE_URL",
    )

    secret_key: str = Field(
        default="change-me",
        alias="SECRET_KEY",
    )

    algorithm: str = Field(
        default="HS256",
        alias="ALGORITHM",
    )

    access_token_expire_minutes: int = Field(
        default=120,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )

    admin_email: str = Field(
        default="admin@event.local",
        alias="ADMIN_EMAIL",
    )
    admin_password: str = Field(
        default="change-me",
        alias="ADMIN_PASSWORD",
)

    # Mail Settings

    mail_username: str = Field(
        default="",
        alias="MAIL_USERNAME",
    )

    mail_password: str = Field(
        default="",
        alias="MAIL_PASSWORD",
    )

    mail_from: str = Field(
        default="",
        alias="MAIL_FROM",
    )

    mail_port: int = Field(
        default=587,
        alias="MAIL_PORT",
    )

    mail_server: str = Field(
        default="smtp.gmail.com",
        alias="MAIL_SERVER",
    )

    mail_starttls: bool = Field(
        default=True,
        alias="MAIL_STARTTLS",
    )

    mail_ssl_tls: bool = Field(
        default=False,
        alias="MAIL_SSL_TLS",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
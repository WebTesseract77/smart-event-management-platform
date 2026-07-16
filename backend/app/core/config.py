from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    

    app_name: str = "EventSphere"

    environment: str = Field(
        default="production",
        alias="ENVIRONMENT",
    )

    api_v1_prefix: str = "/api/v1"

    frontend_url: str | None = Field(
        default=None,
        alias="FRONTEND_URL",
    )




    database_url: str = Field(
        default="sqlite:///./smart_event.db",
        alias="DATABASE_URL",
    )




    secret_key: str = Field(
        alias="SECRET_KEY",
    )

    qr_secret_key: str = Field(
    alias="QR_SECRET_KEY",
    )

    algorithm: str = Field(
        default="HS256",
        alias="ALGORITHM",
    )

    access_token_expire_minutes: int = Field(
        default=120,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )


    admin_name: str = Field(
        default="Administrator",
        alias="ADMIN_NAME",
    )

    admin_email: str = Field(
        alias="ADMIN_EMAIL",
    )

    admin_password: str = Field(
        alias="ADMIN_PASSWORD",
    )


    

    mail_username: str = Field(
        alias="MAIL_USERNAME",
    )

    mail_password: str = Field(
        alias="MAIL_PASSWORD",
    )

    mail_from: str = Field(
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




    razorpay_key_id: str = Field(
        default="",
        alias="RAZORPAY_KEY_ID",
    )

    razorpay_key_secret: str = Field(
        default="",
        alias="RAZORPAY_KEY_SECRET",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

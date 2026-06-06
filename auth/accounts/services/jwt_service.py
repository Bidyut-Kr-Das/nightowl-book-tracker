from django.conf import settings
import jwt
from datetime import datetime, timedelta, timezone

class JWTService():
    MAX_REFRESH_TOKEN_DAY=settings.JWT_REFRESH_DAYS
    MAX_ACCESS_TOKEN_MINUTE=settings.JWT_ACCESS_MINUTE

    @classmethod
    def generate_access_token(cls,data:dict):
        payload = {
            **data,
            "type":"access",
            "iat":datetime.now(timezone.utc),
            "exp":datetime.now(timezone.utc)+ timedelta(minutes=cls.MAX_ACCESS_TOKEN_MINUTE)
        }

        access_token = jwt.encode(algorithm="RS256",payload=payload,key=settings.JWT_PRIVATE_KEY)

        return access_token
    
    @classmethod
    def generate_refresh_token(cls, data: dict):
        payload = {
            **data,
            "type":"refresh",
            "iat":datetime.now(timezone.utc),
            "exp":datetime.now(timezone.utc)+ timedelta(days=cls.MAX_REFRESH_TOKEN_DAY)
        }

        refresh_token = jwt.encode(algorithm="RS256",payload=payload, key=settings.JWT_PRIVATE_KEY)
        return refresh_token
    
    @classmethod
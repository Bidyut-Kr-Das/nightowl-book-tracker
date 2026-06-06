from accounts.lib.redis import redis_client
import random
class OTPService:
    OTP_EXPIRY_SECONDS=300


    @classmethod
    def generate_otp(cls,email:str):
        otp = random.randint(100000, 999999)

        redis_client.set(name=f"otp:{email}", value=otp, ex=cls.OTP_EXPIRY_SECONDS)

        return otp
    
    @staticmethod
    def verify_otp(email:str, otp:int):
        active_otp = redis_client.get(name=f"otp:{email}")
        return active_otp == otp

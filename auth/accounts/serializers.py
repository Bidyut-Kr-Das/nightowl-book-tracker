from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()

class OTPSerializer(serializers.Serializer):
    otp=serializers.IntegerField(max_value=999999)

    
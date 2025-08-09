from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, UserProfile, UserAddress
import re


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    terms_accepted = serializers.BooleanField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 'phone',
            'password', 'password_confirm', 'company_name', 'business_type',
            'address', 'city', 'state', 'pincode', 'preferred_language',
            'is_wholesale_customer', 'terms_accepted'
        ]
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("यो इमेल पहिले नै दर्ता छ।")
        return value
    
    def validate_phone(self, value):
        if value:
            # Basic Nepali phone number validation
            phone_pattern = r'^(\+977|977|0)?[0-9]{9,10}$'
            if not re.match(phone_pattern, value):
                raise serializers.ValidationError("मान्य फोन नम्बर प्रविष्ट गर्नुहोस्।")
            
            if User.objects.filter(phone=value).exists():
                raise serializers.ValidationError("यो फोन नम्बर पहिले नै प्रयोग भइसकेको छ।")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("यो प्रयोगकर्ता नाम पहिले नै लिइसकेको छ।")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("पासवर्डहरू मेल खाँदैन।")
        
        if not attrs.get('terms_accepted'):
            raise serializers.ValidationError("सर्तहरू स्वीकार गर्नुहोस्।")
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data.pop('terms_accepted')
        
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("यो खाता निष्क्रिय छ।")
                attrs['user'] = user
            else:
                raise serializers.ValidationError("गलत इमेल वा पासवर्ड।")
        else:
            raise serializers.ValidationError("इमेल र पासवर्ड आवश्यक छ।")
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    display_name = serializers.CharField(read_only=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name', 'display_name',
            'phone', 'company_name', 'business_type', 'gst_number', 'address', 'city',
            'state', 'pincode', 'profile_image', 'date_of_birth', 'gender',
            'preferred_language', 'is_wholesale_customer', 'wholesale_discount',
            'email_verified', 'phone_verified', 'created_at', 'last_login', 'is_staff'
        ]
        read_only_fields = [
            'id', 'email', 'wholesale_discount', 'email_verified',
            'phone_verified', 'created_at', 'last_login', 'is_staff'
        ]



class UserProfileDetailSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    addresses = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'phone',
            'company_name', 'business_type', 'gst_number', 'address', 'city', 
            'state', 'pincode', 'profile_image', 'preferred_language',
            'is_wholesale_customer', 'profile', 'addresses'
        ]
    
    def get_profile(self, obj):
        try:
            profile = obj.profile
            return {
                'loyalty_points': profile.loyalty_points,
                'total_orders': profile.total_orders,
                'total_spent': float(profile.total_spent),
                'referral_code': profile.referral_code,
                'email_notifications': profile.email_notifications,
                'sms_notifications': profile.sms_notifications,
                'whatsapp_notifications': profile.whatsapp_notifications,
                'marketing_emails': profile.marketing_emails,
            }
        except UserProfile.DoesNotExist:
            return None
    
    def get_addresses(self, obj):
        addresses = obj.addresses.filter(is_active=True)
        return UserAddressSerializer(addresses, many=True).data


class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = [
            'id', 'address_type', 'name', 'address_line1', 'address_line2',
            'city', 'state', 'pincode', 'country', 'phone', 'landmark',
            'is_default', 'created_at'
        ]


class UserAddressCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = [
            'address_type', 'name', 'address_line1', 'address_line2',
            'city', 'state', 'pincode', 'country', 'phone', 'landmark', 'is_default'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        return UserAddress.objects.create(user=user, **validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("गलत पुरानो पासवर्ड।")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("नयाँ पासवर्डहरू मेल खाँदैन।")
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("यो इमेल दर्ता भएको छैन।")
        return value


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("पासवर्डहरू मेल खाँदैन।")
        return attrs
    
# serializers_user_admin.py
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name",
            "is_active", "is_staff", "date_joined", "password",
        ]
        read_only_fields = ["date_joined"]

    def create(self, validated_data):
        pwd = validated_data.pop("password", None)
        user = User(**validated_data)
        if pwd:
            user.set_password(pwd)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        pwd = validated_data.pop("password", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if pwd:
            instance.set_password(pwd)
        instance.save()
        return instance

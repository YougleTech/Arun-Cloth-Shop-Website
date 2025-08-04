from rest_framework import generics, status, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import logout
from django.utils import timezone
from django.shortcuts import get_object_or_404
import secrets
from datetime import timedelta

from .models import User, UserProfile, UserAddress, EmailVerification, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserProfileDetailSerializer, UserAddressSerializer, UserAddressCreateSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view with additional user data"""
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get user data
            serializer = UserLoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                
                # Update last login IP
                user.last_login_ip = self.get_client_ip(request)
                user.save()
                
                # Add user data to response
                user_data = UserProfileSerializer(user).data
                response.data['user'] = user_data
                response.data['message'] = 'सफलतापूर्वक लग इन भयो।'
        
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Create email verification token
            self.create_email_verification(user)
            
            return Response({
                'message': 'सफलतापूर्वक दर्ता भयो। इमेल प्रमाणीकरण आवश्यक छ।',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def create_email_verification(self, user):
        """Create email verification token"""
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=24)
        
        EmailVerification.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # TODO: Send verification email
        # This can be implemented with Django's email system
        print(f"Email verification token for {user.email}: {token}")


class UserProfileViewSet(viewsets.ModelViewSet):
    """User profile management"""
    serializer_class = UserProfileDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
    
    def get_object(self):
        return self.request.user
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update user profile"""
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'प्रोफाइल अपडेट भयो।',
                'user': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'message': 'पासवर्ड परिवर्तन भयो।'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get user dashboard statistics"""
        user = request.user
        profile = user.profile
        
        # TODO: Get actual order statistics from orders app
        stats = {
            'total_orders': profile.total_orders,
            'total_spent': float(profile.total_spent),
            'loyalty_points': profile.loyalty_points,
            'active_quotes': 0,  # TODO: Implement from quotes app
            'favorite_products': 0,  # TODO: Implement favorites
            'pending_orders': 0,  # TODO: Implement from orders app
        }
        
        return Response(stats)


class UserAddressViewSet(viewsets.ModelViewSet):
    """User addresses management"""
    serializer_class = UserAddressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user, is_active=True)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserAddressCreateSerializer
        return UserAddressSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            address = serializer.save()
            return Response({
                'message': 'ठेगाना थपियो।',
                'address': UserAddressSerializer(address).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            address = serializer.save()
            return Response({
                'message': 'ठेगाना अपडेट भयो।',
                'address': UserAddressSerializer(address).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response({
            'message': 'ठेगाना हटाइयो।'
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set address as default"""
        address = self.get_object()
        
        # Remove default from all other addresses
        UserAddress.objects.filter(user=request.user).update(is_default=False)
        
        # Set this address as default
        address.is_default = True
        address.save()
        
        return Response({
            'message': 'मुख्य ठेगाना सेट भयो।',
            'address': UserAddressSerializer(address).data
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send password reset email"""
    serializer = ForgotPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = get_object_or_404(User, email=email, is_active=True)
        
        # Generate reset token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=2)
        
        PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # TODO: Send reset email
        print(f"Password reset token for {user.email}: {token}")
        
        return Response({
            'message': 'पासवर्ड रिसेट लिंक इमेलमा पठाइयो।'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password with token"""
    serializer = ResetPasswordSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            
            if reset_token.is_expired():
                return Response({
                    'error': 'टोकन समाप्त भयो।'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if reset_token.is_used():
                return Response({
                    'error': 'टोकन पहिले नै प्रयोग भइसकेको छ।'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset password
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.used_at = timezone.now()
            reset_token.save()
            
            return Response({
                'message': 'पासवर्ड सफलतापूर्वक रिसेट भयो।'
            })
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'error': 'गलत टोकन।'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout"""
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'सफलतापूर्वक लग आउट भयो।'
        })
    except Exception as e:
        return Response({
            'error': 'लग आउट गर्न सकिएन।'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """Verify email address"""
    token = request.data.get('token')
    if not token:
        return Response({
            'error': 'टोकन आवश्यक छ।'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        verification = EmailVerification.objects.get(token=token, verified_at__isnull=True)
        
        if verification.is_expired():
            return Response({
                'error': 'टोकन समाप्त भयो।'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify email
        user = verification.user
        user.email_verified = True
        user.save()
        
        verification.verified_at = timezone.now()
        verification.save()
        
        return Response({
            'message': 'इमेल सफलतापूर्वक प्रमाणीकृत भयो।'
        })
        
    except EmailVerification.DoesNotExist:
        return Response({
            'error': 'गलत टोकन।'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_availability(request):
    """Check if email/username is available"""
    email = request.GET.get('email')
    username = request.GET.get('username')
    phone = request.GET.get('phone')
    
    result = {}
    
    if email:
        result['email_available'] = not User.objects.filter(email=email).exists()
    
    if username:
        result['username_available'] = not User.objects.filter(username=username).exists()
    
    if phone:
        result['phone_available'] = not User.objects.filter(phone=phone).exists()
    
    return Response(result)
import dj_database_url
import os
from datetime import timedelta
from django.test.runner import DiscoverRunner
from pathlib import Path

ENV = os.environ.get('ENV')

# 開発環境でのみ.envファイルを読み込む
if ENV != 'production':
    from dotenv import load_dotenv
    load_dotenv()

# 開発環境以外でDEBUGを無効にする
DEBUG = ENV != 'production'

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', default='your secret key')

#HTTP リクエストの Host: ヘッダーを検証するために使用
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS').split(',')

RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

#CORS設定

#cookieをクロスオリジンのHTTPリクエストに含める
CORS_ALLOW_CREDENTIALS = True

CORS_ORIGIN_WHITELIST = os.environ.get('CORS_ORIGIN_WHITELIST').split(',')

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]



INSTALLED_APPS = [
    'myapp.apps.RenderConfig',
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.humanize",
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'djoser',

    #googleログイン用にインストール
    'oauth2_provider',

    'cloudinary',
    'cloudinary_storage',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'myapp.middleware.SecurityHeadersMiddleware', # googleログイン用にテスト追加
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]

# 開発環境でのみdebug_toolbarを読み込む
if ENV != 'production':
    INSTALLED_APPS.append('debug_toolbar')
    MIDDLEWARE.append('debug_toolbar.middleware.DebugToolbarMiddleware')

SESSION_COOKIE_SECURE = False

SIMPLE_JWT = {
    #トークンの時間設定
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    #暗号のアルゴリズム設定
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('JWT',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

#googlログイン用に追加
AUTHENTICATION_BACKENDS = (
    # Google OAuth2 の認証バックエンド
    'social_core.backends.google.GoogleOAuth2',

    # Django の認証バックエンド
    'django.contrib.auth.backends.ModelBackend',
)

#GoogleAuth
SOCIAL_AUTH_GOOGLE_OAUTH2_CLIENTID = os.getenv("SOCIAL_AUTH_GOOGLE_OAUTH2_CLIENTID")
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.getenv("SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET")

#GoogleAuthのリダイレクトURL
HOST_URL =  os.environ.get('HOST_URL')

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],

    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
    ]
}

ROOT_URLCONF = "mysite.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",

                # googleログイン用に追加
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ]
        },
    }
]

WSGI_APPLICATION = "mysite.wsgi.application"

MAX_CONN_AGE = 600

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}

AUTH_USER_MODEL = 'myapp.Account'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
    "django.contrib.auth.hashers.BCryptPasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS':{"min_length":10}, },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    #{'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]



#言語とタイムゾーン
LANGUAGE_CODE = "ja"
TIME_ZONE = "Asia/Tokyo"
USE_I18N = True
USE_TZ = True
USE_L10N = True



#メール送信
DEFAULT_FROM_EMAIL = 'info@post-match.com'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' # コンソールログでメールテキストを送信する



# staticフォルダへの絶対パスを定義
STATIC_DIR = BASE_DIR / "myapp" / "static"
STATIC_URL = '/static/'
STATICFILES_DIRS = [STATIC_DIR,]
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

#CDN
CLOUDINARY_STORAGE  = {
  'CLOUD_NAME': os.getenv('CLOUDINARY_NAME'),
  'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
  'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
}

#外部API
FOOTBALLDATA_API_URL = os.getenv('FOOTBALLDATA_API_URL')
FOOTBALLDATA_API_TOKEN = os.getenv('FOOTBALLDATA_API_TOKEN')

#ログ出力

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

#djangotoolbarを表示するために必要

INTERNAL_IPS = [    
    "127.0.0.1",
]

DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK" : lambda request: True,
}
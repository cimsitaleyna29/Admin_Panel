from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

# Şifreleme ve token ayarları
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# bcrypt ile şifreleme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Kullanıcıdan gelen düz şifreyi hashli şifre ile karşılaştırır.
    bcrypt maksimum 72 karakter desteklediği için fazlasını kırpıyoruz.
    """
    return pwd_context.verify(plain_password[:72], hashed_password)

def get_password_hash(password: str) -> str:
    """
    Düz şifreyi hashleyip döndürür.
    bcrypt maksimum 72 karakter desteklediği için fazlasını kırpıyoruz.
    """
    password = password[:72]
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    """
    JWT token oluşturur.
    Token, SECRET_KEY ve ALGORITHM ile imzalanır.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

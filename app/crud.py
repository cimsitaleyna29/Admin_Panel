from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

try:
    from .security import get_password_hash
    from . import models, schemas
except ImportError:
    from security import get_password_hash  # type: ignore
    import models, schemas  # type: ignore

# ============================================================
# 🟢 CREATE (Yeni kullanıcı oluşturma)
# ============================================================
def create_user(db: Session, user: schemas.UserCreate):
    """
    Yeni kullanıcı oluşturur.
    Şifre hashlenir, rol 'user' ve aktiflik True olarak atanır.
    """
    db_user = models.User(
        name=user.name,
        surname=user.surname,
        email=user.email,
        phone=user.phone,
        password_hash=get_password_hash(user.password),
        role="user",
        is_active=True
    )
    db.add(db_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(db_user)
    return db_user


# ============================================================
# 🔵 READ (Kullanıcıları okuma)
# ============================================================

def get_user_by_email(db: Session, email: str):
    """
    E-posta adresine göre kullanıcıyı döndürür.
    """
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    """
    ID'ye göre kullanıcıyı döndürür.
    """
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_users(db: Session):
    """
    Tüm kullanıcıları liste olarak döndürür.
    """
    return db.query(models.User).all()


# ============================================================
# 🟠 UPDATE (Kullanıcı bilgilerini güncelleme)
# ============================================================

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    """
    Belirli bir kullanıcıyı günceller.
    Şifre gönderildiyse hashleyip kaydeder.
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None

    # Role veya aktiflik güncellemesi (sadece admin tarafından yapılabilir)
    if user.role is not None:
        db_user.role = user.role
    
    db_user.name = user.name
    db_user.surname =user.surname
    db_user.email= user.email
    db_user.phone= user.phone
    
    db.commit()
    db.refresh(db_user)
    return db_user


# ============================================================
# 🔴 DELETE (Kullanıcı silme)
# ============================================================

def delete_user(db: Session, user_id: int):
    """
    Kullanıcıyı tamamen siler.
    Gerçek hayatta genelde 'pasif' yapılır, silinmez.
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None

    db.delete(db_user)
    db.commit()
    return db_user

######################

# ============================================================
# 🟣 ROLE UPDATE (Kullanıcının rolünü değiştirme)
# ============================================================

def update_user_role(db: Session, user_id: int, new_role: str):
    """
    Admin tarafından kullanıcı rolünü günceller.
    new_role parametresi 'admin' veya 'user' olabilir.
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None

    db_user.role = new_role
    db.commit()
    db.refresh(db_user)
    return db_user

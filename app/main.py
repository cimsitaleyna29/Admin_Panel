from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


try:
    from . import crud, models, schemas
    from .database import Base, engine, get_db
    from .security import verify_password, create_access_token, SECRET_KEY, ALGORITHM
except ImportError:
    import crud, models, schemas  # type: ignore
    from database import Base, engine, get_db  # type: ignore
    from security import verify_password, create_access_token, SECRET_KEY, ALGORITHM  # type: ignore

# ============================================================
# 🌐 Uygulama kurulumu
# ============================================================

Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Role System", version="1.0.0",docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ============================================================
# 🔐 Kullanıcı kimlik doğrulama yardımcı fonksiyonu
# ============================================================

@app.get("/")
def read_root():
    return {"message": "User Role System API is running successfully"}

#FastAPI projenin ana sayfasına basit bir mesaj döndüren bir root endpoint.
def get_current_user(token: str = Security(oauth2_scheme), db: Session = Depends(get_db)):
    """
    JWT token'ı çözümler, geçerli kullanıcıyı döndürür.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token geçersiz.")
        user = crud.get_user_by_email(db, email)
        if user is None:
            raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı.")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token doğrulanamadı.")


# ============================================================
# 🟢 CREATE — Yeni kullanıcı oluşturma
# ============================================================

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Yeni kullanıcı ekler. Şifre hashlenir, rol 'user' olur.
    """
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı.")
    return crud.create_user(db, user)


# ============================================================
# 🔵 READ — Kullanıcıları listeleme ve tek kullanıcıyı getirme
# ============================================================

@app.get("/users/", response_model=list[schemas.UserResponse])
def read_users(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Tüm kullanıcıları getirir. Sadece admin görebilir.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sadece admin kullanıcılar bu işlemi yapabilir.")
    return crud.get_users(db)


@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Belirli kullanıcıyı getirir. Admin her kullanıcıyı görebilir, user sadece kendini.
    """
    db_user = crud.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    if current_user.role != "admin" and current_user.id != db_user.id:
        raise HTTPException(status_code=403, detail="Sadece kendi bilgilerinizi görüntüleyebilirsiniz.")
    return db_user


# ============================================================
# 🟠 UPDATE — Kullanıcı güncelleme
# ============================================================

@app.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Kullanıcı bilgilerini günceller.
    Admin herkesin, user sadece kendi hesabını güncelleyebilir.
    """
    db_user = crud.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    # yetki kontrolü
    if current_user.role != "admin" and current_user.id != db_user.id:
        raise HTTPException(status_code=403, detail="Sadece kendi bilgilerinizi güncelleyebilirsiniz.")

    updated_user = crud.update_user(db, user_id, user)
    return updated_user

###########################
# ============================================================
# 🟣 ROLE UPDATE — Kullanıcının rolünü değiştirme
# ============================================================

@app.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    new_role: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin kullanıcı, başka bir kullanıcının rolünü günceller.
    Örnek istek: PUT /users/5/role?new_role=admin
    """
    # Sadece admin değiştirebilir
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sadece admin kullanıcı rol değiştirebilir.")

    # Rol değeri kontrolü
    if new_role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Geçersiz rol. 'admin' veya 'user' olmalı.")

    # CRUD fonksiyonunu çağır
    user = crud.update_user_role(db, user_id, new_role)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    
    return {"message": f"{user.name} kullanıcısının rolü '{new_role}' olarak güncellendi."}



# ============================================================
# 🔴 DELETE — Kullanıcı silme
# ============================================================

@app.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Kullanıcıyı tamamen siler.
    Sadece admin kullanıcı silebilir.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sadece admin kullanıcı silebilir.")
    db_user = crud.delete_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    return {"message": f"{db_user.name} kullanıcısı başarıyla silindi."}


# ============================================================
# 🧑‍💼 LOGIN — Giriş işlemi (JWT Token üretir)
# ============================================================

@app.post("/auth/login")
def login(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    E-posta ve şifre ile giriş yapar, JWT token döner.
    """
    user = crud.get_user_by_email(db, form_data.email)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesap pasif durumda.")
    access_token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

if __name__ == "_main_":
    uvicorn.run(app, host="0.0.0.0", port=8000)
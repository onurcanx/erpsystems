# Mini ERP

Bu proje, temel stok ve ürün yönetimi işlemlerini yapabileceğiniz bir Mini ERP (Kurumsal Kaynak Planlama) uygulamasıdır. Kullanıcı girişi, ürün ekleme, stok takibi, geçmiş görüntüleme gibi özellikler içerir.

## Özellikler
- Kullanıcı girişi ve yetkilendirme
- Ürün ekleme, düzenleme, silme
- Stok giriş/çıkış işlemleri
- Ürün geçmişi ve değişiklik takibi
- Kategorilere göre ürün listeleme
- Son işlemler ve bildirimler

## Kurulum

### 1. Depoyu Klonlayın
```bash
git clone <repo-linkiniz>
cd ERP2
```

### 2. Frontend Kurulumu
```bash
cd frontend
npm install
```

### 3. Backend Kurulumu
Backend dizinine girip gerekli bağımlılıkları yükleyin (örneğin Python için):
```bash
cd ../backend
pip install -r requirements.txt
```

### 4. Uygulamayı Çalıştırma
#### Frontend
```bash
cd frontend
npm start
```
#### Backend
```bash
cd backend
python app.py
```

## Kullanım
- `http://localhost:3000` adresinden arayüze erişebilirsiniz.
- İlk giriş için bir kullanıcı oluşturun veya mevcut kullanıcı ile giriş yapın.
- Ürün ekleyin, stok işlemleri yapın ve geçmişi görüntüleyin.

## Katkı
Katkıda bulunmak için lütfen bir fork oluşturun ve pull request gönderin.

## Lisans
Bu proje MIT lisansı ile lisanslanmıştır. 
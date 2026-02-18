# Crowdsourced Review Platform

A full-stack MERN application that allows users to review and rate local businesses. 
Users can browse businesses, submit reviews, and rate them on multiple criteria. 
Admins can approve or reject reviews before they are published.


Demo : https://drive.google.com/file/d/1aHZ4tmer70U3oz92v4g5mXkI5ASl85J7/view?usp=sharing

---

##  Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Token)
- **Password Security:** bcrypt
- **Version Control:** Git & GitHub

---


##  Features

###  User Features
- User Registration & Login (JWT Authentication)
- Browse businesses
- Filter businesses by category/location
- Submit reviews with ratings:
  - Quality
  - Service
  - Value
- View approved reviews

###  Admin Features
- View pending reviews
- Approve or reject reviews
- Manage business listings

###  System Features
- Rating aggregation (average calculated from approved reviews)
- Secure password hashing
- Role-based access control

---

##  Authentication Flow

1. User registers
2. Password is hashed using bcrypt
3. JWT token is generated on login
4. Token is used to access protected routes
5. Admin-only routes are protected using role middleware

---

##  Database Design

### User
- name
- email
- password
- role (user/admin)

### Business
- name
- category
- location
- description
- averageRating

### Review
- user (reference)
- business (reference)
- quality
- service
- value
- comment
- status (pending/approved/rejected)

---


### Installation & Setup

### 1. Clone Repo
```
git clone https://github.com/infLocus/Crowdsourced-Review-Platform.git
```
### 2️. Backend Setup
```
cd server
npm install
npm run dev
```

### 3️. Frontend Setup
```
cd client
npm install
npm run dev
```

---

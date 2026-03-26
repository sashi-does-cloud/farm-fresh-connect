"""
FarmFresh - Python Flask Backend Starter
=========================================
Requirements: pip install flask flask-cors flask-jwt-extended mysql-connector-python bcrypt python-dotenv psycopg2-binary
  
"""

import os
import psycopg2
import sqlite3
import uuid
from datetime import datetime, timedelta
from functools import wraps
from dotenv import load_dotenv
import os

from flask import Flask, request, jsonify
from flask_cors import CORS


from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

load_dotenv()
# ─── Try MySQL, fall back to SQLite for quick testing ──────────
try:
    import mysql.connector
    USE_MYSQL = True
except ImportError:
    import sqlite3
    USE_MYSQL = True
    print(" mysql-connector-python not installed. Using SQLite for demo.")

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "change-this-secret")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
jwt = JWTManager(app)


# ─── Database helpers ──────────────────────────────────────────

import psycopg2
import os

    
def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        dbname=os.getenv("DB_NAME"),
        port=5432,
        sslmode="require"
    )


def init_db():
    """Create tables if they don't exist."""
    conn = get_db()
    cur = conn.cursor()

    if USE_MYSQL:
        auto = "AUTO_INCREMENT"
        id_type = "VARCHAR(36) PRIMARY KEY"
        text_type = "TEXT"
    else:
        auto = ""
        id_type = "TEXT PRIMARY KEY"
        text_type = "TEXT"

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS users (
            id {id_type},
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'buyer',
            phone VARCHAR(20),
            location VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS products (
            id {id_type},
            farmer_id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description {text_type},
            category VARCHAR(50) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            unit VARCHAR(50) NOT NULL,
            quantity INT NOT NULL DEFAULT 0,
            image VARCHAR(500),
            available BOOLEAN DEFAULT TRUE,
            rating DECIMAL(2,1) DEFAULT 0,
            reviews INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS orders (
            id {id_type},
            buyer_id VARCHAR(36) NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            address {text_type},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS order_items (
            id {id_type},
            order_id VARCHAR(36) NOT NULL,
            product_id VARCHAR(36) NOT NULL,
            quantity INT NOT NULL,
            price DECIMAL(10,2) NOT NULL
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Database tables ready")


# ─── Password hashing ─────────────────────────────────────────

try:
    import bcrypt
    def hash_password(pw): return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
    def check_password(pw, hashed): return bcrypt.checkpw(pw.encode(), hashed.encode())
except ImportError:
    import hashlib
    print("⚠️  bcrypt not installed. Using SHA256 (not recommended for production).")
    def hash_password(pw): return hashlib.sha256(pw.encode()).hexdigest()
    def check_password(pw, hashed): return hashlib.sha256(pw.encode()).hexdigest() == hashed


# ─── Auth Routes ───────────────────────────────────────────────

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    user_id = str(uuid.uuid4())
    hashed = hash_password(data["password"])

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (id, name, email, password, role) VALUES (%s, %s, %s, %s, %s)" if USE_MYSQL
            else "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
            (user_id, data["name"], data["email"], hashed, data.get("role", "buyer"))
        )
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({"message": "Email already registered"}), 409

    conn.close()
    # token = create_access_token(identity={"id": user_id, "role": data.get("role", "buyer")})
    token = create_access_token(
    identity=str(user_id),
    additional_claims={"role": role}
)
    return jsonify({
        "user": {"id": user_id, "name": data["name"], "email": data["email"], "role": data.get("role", "buyer")},
        "token": token
    }), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, password, role, location FROM users WHERE email = %s AND role = %s" if USE_MYSQL
        else "SELECT id, name, email, password, role, location FROM users WHERE email = ? AND role = ?",
        (data["email"], data.get("role", "buyer"))
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        return jsonify({"message": "Invalid credentials"}), 401

    if USE_MYSQL:
        uid, name, email, pw_hash, role, location = row
    else:
        uid, name, email, pw_hash, role, location = row["id"], row["name"], row["email"], row["password"], row["role"], row["location"]

    if not check_password(data["password"], pw_hash):
        return jsonify({"message": "Invalid credentials"}), 401

    # token = create_access_token(identity={"id": uid, "role": role})
    token = create_access_token(
    identity=str(user_id),
    additional_claims={"role": role}
)
    return jsonify({
        "user": {"id": uid, "name": name, "email": email, "role": role, "location": location},
        "token": token
    })


@app.route("/api/auth/profile", methods=["GET"])
@jwt_required()
def profile():
    # identity = get_jwt_identity()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, role, phone, location FROM users WHERE id = %s" if USE_MYSQL
        else "SELECT id, name, email, role, phone, location FROM users WHERE id = ?",
        (identity["id"],)
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"message": "User not found"}), 404

    if USE_MYSQL:
        return jsonify({"id": row[0], "name": row[1], "email": row[2], "role": row[3], "phone": row[4], "location": row[5]})
    return jsonify(dict(row))


# ─── Product Routes ───────────────────────────────────────────

@app.route("/api/products", methods=["GET"])
def get_products():
    conn = get_db()
    cur = conn.cursor()

    query = """
        SELECT p.id, p.farmer_id, u.name as farmer_name, p.name, p.description,
               p.category, p.price, p.unit, p.quantity, p.image, p.available,
               p.rating, p.reviews, p.created_at
        FROM products p JOIN users u ON p.farmer_id = u.id
        WHERE p.available = TRUE
    """
    params = []
    category = request.args.get("category")
    search = request.args.get("search")

    if category and category != "all":
        query += (" AND p.category = %s" if USE_MYSQL else " AND p.category = ?")
        params.append(category)
    if search:
        query += (" AND (p.name LIKE %s OR p.description LIKE %s)" if USE_MYSQL
                  else " AND (p.name LIKE ? OR p.description LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])

    sort = request.args.get("sort")
    if sort == "price-low":
        query += " ORDER BY p.price ASC"
    elif sort == "price-high":
        query += " ORDER BY p.price DESC"
    elif sort == "rating":
        query += " ORDER BY p.rating DESC"
    else:
        query += " ORDER BY p.created_at DESC"

    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    products = []
    for r in rows:
        if USE_MYSQL:
            products.append({
                "id": r[0], "farmerId": r[1], "farmerName": r[2], "name": r[3],
                "description": r[4], "category": r[5], "price": float(r[6]),
                "unit": r[7], "quantity": r[8], "image": r[9] or "",
                "available": bool(r[10]), "rating": float(r[11]), "reviews": r[12],
                "createdAt": str(r[13])
            })
        else:
            products.append({
                "id": r["id"], "farmerId": r["farmer_id"], "farmerName": r["farmer_name"],
                "name": r["name"], "description": r["description"], "category": r["category"],
                "price": float(r["price"]), "unit": r["unit"], "quantity": r["quantity"],
                "image": r["image"] or "", "available": bool(r["available"]),
                "rating": float(r["rating"]), "reviews": r["reviews"],
                "createdAt": str(r["created_at"])
            })

    return jsonify(products)


@app.route("/api/products/my", methods=["GET"])
@jwt_required()
def get_my_products():
    identity = get_jwt_identity()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, farmer_id, name, description, category, price, unit, quantity, image, available, rating, reviews, created_at FROM products WHERE farmer_id = %s" if USE_MYSQL
        else "SELECT id, farmer_id, name, description, category, price, unit, quantity, image, available, rating, reviews, created_at FROM products WHERE farmer_id = ?",
        (identity["id"],)
    )
    rows = cur.fetchall()
    conn.close()

    products = []
    for r in rows:
        if USE_MYSQL:
            products.append({
                "id": r[0], "farmerId": r[1], "farmerName": "", "name": r[2],
                "description": r[3], "category": r[4], "price": float(r[5]),
                "unit": r[6], "quantity": r[7], "image": r[8] or "",
                "available": bool(r[9]), "rating": float(r[10]), "reviews": r[11],
                "createdAt": str(r[12])
            })
        else:
            products.append({
                "id": r["id"], "farmerId": r["farmer_id"], "farmerName": "",
                "name": r["name"], "description": r["description"], "category": r["category"],
                "price": float(r["price"]), "unit": r["unit"], "quantity": r["quantity"],
                "image": r["image"] or "", "available": bool(r["available"]),
                "rating": float(r["rating"]), "reviews": r["reviews"],
                "createdAt": str(r["created_at"])
            })

    return jsonify(products)


@app.route("/api/products", methods=["POST"])
@jwt_required()
def create_product():
    identity = get_jwt_identity()
    if identity["role"] != "farmer":
        return jsonify({"message": "Only farmers can add products"}), 403

    data = request.json
    product_id = str(uuid.uuid4())

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO products (id, farmer_id, name, description, category, price, unit, quantity, image) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)" if USE_MYSQL
        else "INSERT INTO products (id, farmer_id, name, description, category, price, unit, quantity, image) VALUES (?,?,?,?,?,?,?,?,?)",
        (product_id, identity["id"], data["name"], data.get("description", ""),
         data["category"], data["price"], data["unit"], data["quantity"], data.get("image", ""))
    )
    conn.commit()
    conn.close()

    return jsonify({"id": product_id, "message": "Product created"}), 201


@app.route("/api/products/<product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):
    identity = get_jwt_identity()
    data = request.json

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE products SET name=%s, description=%s, category=%s, price=%s, unit=%s, quantity=%s, available=%s WHERE id=%s AND farmer_id=%s" if USE_MYSQL
        else "UPDATE products SET name=?, description=?, category=?, price=?, unit=?, quantity=?, available=? WHERE id=? AND farmer_id=?",
        (data["name"], data.get("description", ""), data["category"], data["price"],
         data["unit"], data["quantity"], data.get("available", True), product_id, identity["id"])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Product updated"})


@app.route("/api/products/<product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    identity = get_jwt_identity()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM products WHERE id=%s AND farmer_id=%s" if USE_MYSQL
        else "DELETE FROM products WHERE id=? AND farmer_id=?",
        (product_id, identity["id"])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Product deleted"})


# ─── Order Routes ─────────────────────────────────────────────

@app.route("/api/orders", methods=["POST"])
@jwt_required()
def create_order():
    identity = get_jwt_identity()
    claims = get_jwt()              # to access role

    user_id = identity
    role = claims["role"]
    data = request.json
    order_id = str(uuid.uuid4())

    conn = get_db()
    cur = conn.cursor()

    total = 0
    for item in data["items"]:
        cur.execute(
            "SELECT price FROM products WHERE id = %s" if USE_MYSQL
            else "SELECT price FROM products WHERE id = ?",
            (item["product_id"],)
        )
        row = cur.fetchone()
        price = float(row[0]) if USE_MYSQL else float(row["price"])
        total += price * item["quantity"]

        item_id = str(uuid.uuid4())
        cur.execute(
            "INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (%s,%s,%s,%s,%s)" if USE_MYSQL
            else "INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?,?,?,?,?)",
            (item_id, order_id, item["product_id"], item["quantity"], price)
        )

    cur.execute(
        "INSERT INTO orders (id, buyer_id, total, address) VALUES (%s,%s,%s,%s)" if USE_MYSQL
        else "INSERT INTO orders (id, buyer_id, total, address) VALUES (?,?,?,?)",
        (order_id, identity["id"], total, data.get("address", ""))
    )
    conn.commit()
    conn.close()

    return jsonify({"id": order_id, "total": total, "status": "pending"}), 201


@app.route("/api/orders/my", methods=["GET"])
@jwt_required()
def my_orders():
    identity = get_jwt_identity()
    
    # Debug print (remove after testing)
    print("JWT Identity received:", identity)
    
    conn = get_db()
    cur = conn.cursor()
    
    # Since you're using PostgreSQL (psycopg2), we use the non-MySQL branch
    cur.execute("""
        SELECT id, total, status, address, created_at 
        FROM orders 
        WHERE buyer_id = %s 
        ORDER BY created_at DESC
    """, (identity["id"],))
    
    rows = cur.fetchall()
    conn.close()

    orders = []
    for r in rows:
        # PostgreSQL returns tuple, not dict by default
        orders.append({
            "id": r[0],
            "total": float(r[1]),
            "status": r[2],
            "address": r[3] or "",
            "createdAt": str(r[4]),
            "items": [],           # Currently empty - we'll improve this later
            "buyerId": identity["id"],
            "buyerName": ""
        })

    return jsonify(orders)

@app.route("/api/orders/farmer", methods=["GET"])
@jwt_required()
def farmer_orders():
    identity = get_jwt_identity()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT DISTINCT o.id, o.total, o.status, o.created_at, u.name as buyer_name
           FROM orders o
           JOIN order_items oi ON o.id = oi.order_id
           JOIN products p ON oi.product_id = p.id
           JOIN users u ON o.buyer_id = u.id
           WHERE p.farmer_id = %s ORDER BY o.created_at DESC""" if USE_MYSQL
        else """SELECT DISTINCT o.id, o.total, o.status, o.created_at, u.name as buyer_name
           FROM orders o
           JOIN order_items oi ON o.id = oi.order_id
           JOIN products p ON oi.product_id = p.id
           JOIN users u ON o.buyer_id = u.id
           WHERE p.farmer_id = ? ORDER BY o.created_at DESC""",
        (identity["id"],)
    )
    rows = cur.fetchall()
    conn.close()

    orders = []
    for r in rows:
        if USE_MYSQL:
            orders.append({"id": r[0], "total": float(r[1]), "status": r[2], "createdAt": str(r[3]), "buyerName": r[4], "items": [], "buyerId": "", "address": ""})
        else:
            orders.append({"id": r["id"], "total": float(r["total"]), "status": r["status"], "createdAt": str(r["created_at"]), "buyerName": r["buyer_name"], "items": [], "buyerId": "", "address": ""})

    return jsonify(orders)


@app.route("/api/orders/<order_id>/status", methods=["PATCH"])
@jwt_required()
def update_order_status(order_id):
    data = request.json
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE orders SET status = %s WHERE id = %s" if USE_MYSQL
        else "UPDATE orders SET status = ? WHERE id = ?",
        (data["status"], order_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Status updated"})


# ─── Start ─────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    print("🌾 FarmFresh API running at http://localhost:5000")
    # app.run(debug=True, port=5000)
    app.run(host="0.0.0.0", port=5000, debug=True)
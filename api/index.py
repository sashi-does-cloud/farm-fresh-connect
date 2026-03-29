"""
FarmFresh - Python Flask Backend Starter
=========================================
Requirements: pip install flask flask-cors flask-jwt-extended bcrypt python-dotenv psycopg2-binary
"""

import os
import uuid
import json
from datetime import timedelta
from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

import psycopg2

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "change-this-secret")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
jwt = JWTManager(app)


# ─── Database ─────────────────────────────────────────────────

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
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'buyer',
            phone VARCHAR(20),
            location VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(36) PRIMARY KEY,
            farmer_id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
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

    cur.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id VARCHAR(36) PRIMARY KEY,
            buyer_id VARCHAR(36) NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id VARCHAR(36) PRIMARY KEY,
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
    print("⚠️  bcrypt not installed. Using SHA256 (not for production).")
    def hash_password(pw): return hashlib.sha256(pw.encode()).hexdigest()
    def check_password(pw, hashed): return hashlib.sha256(pw.encode()).hexdigest() == hashed


# ─── JWT helpers ──────────────────────────────────────────────

def make_token(user_id: str, role: str) -> str:
    return create_access_token(identity=json.dumps({"id": user_id, "role": role}))

def get_identity() -> dict:
    raw = get_jwt_identity()
    try:
        return json.loads(raw)
    except (TypeError, ValueError):
        return raw


# ─── Auth Routes ──────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"message": "Health status <TRUE>"})


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    user_id = str(uuid.uuid4())
    hashed = hash_password(data["password"])
    role = data.get("role", "buyer")

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (id, name, email, password, role) VALUES (%s, %s, %s, %s, %s)",
            (user_id, data["name"], data["email"], hashed, role)
        )
        conn.commit()
    except Exception:
        conn.close()
        return jsonify({"message": "Email already registered"}), 409

    conn.close()
    token = make_token(user_id, role)
    return jsonify({
        "user": {"id": user_id, "name": data["name"], "email": data["email"], "role": role},
        "token": token
    }), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, password, role, location FROM users WHERE email = %s AND role = %s",
        (data["email"], data.get("role", "buyer"))
    )
    row = cur.fetchone()
    conn.close()

    if not row or not check_password(data["password"], row[3]):
        return jsonify({"message": "Invalid credentials"}), 401

    uid, name, email, _, role, location = row
    token = make_token(uid, role)
    return jsonify({
        "user": {"id": uid, "name": name, "email": email, "role": role, "location": location},
        "token": token
    })


@app.route("/api/auth/profile", methods=["GET"])
@jwt_required()
def profile():
    identity = get_identity()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, role, phone, location FROM users WHERE id = %s",
        (identity["id"],)
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"id": row[0], "name": row[1], "email": row[2],
                    "role": row[3], "phone": row[4], "location": row[5]})


# ─── Product Routes ───────────────────────────────────────────

@app.route("/api/products", methods=["GET"])
def get_products():
    conn = get_db()
    cur = conn.cursor()

    query = """
        SELECT p.id, p.farmer_id, u.name AS farmer_name, p.name, p.description,
               p.category, p.price, p.unit, p.quantity, p.image, p.available,
               p.rating, p.reviews, p.created_at
        FROM products p
        JOIN users u ON p.farmer_id = u.id
        WHERE p.available = TRUE
    """
    params = []

    category = request.args.get("category", "").strip()
    search   = request.args.get("search", "").strip()
    sort     = request.args.get("sort", "default").strip()

    if category and category != "all":
        query += " AND p.category = %s"
        params.append(category)

    # FIX: PostgreSQL LIKE is case-sensitive — use ILIKE instead
    if search:
        query += " AND (p.name ILIKE %s OR p.description ILIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])

    if sort == "price-low":
        query += " ORDER BY p.price ASC"
    elif sort == "price-high":
        query += " ORDER BY p.price DESC"
    elif sort == "rating":
        query += " ORDER BY p.rating DESC"
    else:
        query += " ORDER BY p.created_at DESC"

    # FIX: pass params as tuple — psycopg2 requires a sequence, tuple is safest
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    conn.close()

    return jsonify([{
        "id":          r[0],
        "farmerId":    r[1],
        "farmerName":  r[2],
        "name":        r[3],
        "description": r[4],
        "category":    r[5],
        "price":       float(r[6]),
        "unit":        r[7],
        "quantity":    r[8],
        "image":       r[9] or "",
        "available":   bool(r[10]),
        "rating":      float(r[11]),
        "reviews":     r[12],
        "createdAt":   str(r[13]),
    } for r in rows])


@app.route("/api/products/my", methods=["GET"])
@jwt_required()
def get_my_products():
    identity = get_identity()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, farmer_id, name, description, category, price, unit,
                  quantity, image, available, rating, reviews, created_at
           FROM products WHERE farmer_id = %s""",
        (identity["id"],)
    )
    rows = cur.fetchall()
    conn.close()

    return jsonify([{
        "id": r[0], "farmerId": r[1], "farmerName": "", "name": r[2],
        "description": r[3], "category": r[4], "price": float(r[5]),
        "unit": r[6], "quantity": r[7], "image": r[8] or "",
        "available": bool(r[9]), "rating": float(r[10]), "reviews": r[11],
        "createdAt": str(r[12])
    } for r in rows])


@app.route("/api/products", methods=["POST"])
@jwt_required()
def create_product():
    identity = get_identity()
    if identity["role"] != "farmer":
        return jsonify({"message": "Only farmers can add products"}), 403

    data = request.json
    product_id = str(uuid.uuid4())

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO products (id, farmer_id, name, description, category,
                                 price, unit, quantity, image)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (product_id, identity["id"], data["name"], data.get("description", ""),
         data["category"], data["price"], data["unit"],
         data["quantity"], data.get("image", ""))
    )
    conn.commit()
    conn.close()
    return jsonify({"id": product_id, "message": "Product created"}), 201


@app.route("/api/products/<product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):
    identity = get_identity()
    data = request.json
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """UPDATE products SET name=%s, description=%s, category=%s, price=%s,
                               unit=%s, quantity=%s, available=%s
           WHERE id=%s AND farmer_id=%s""",
        (data["name"], data.get("description", ""), data["category"],
         data["price"], data["unit"], data["quantity"],
         data.get("available", True), product_id, identity["id"])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Product updated"})


@app.route("/api/products/<product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    identity = get_identity()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM products WHERE id=%s AND farmer_id=%s",
        (product_id, identity["id"])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Product deleted"})


# ─── Order Routes ─────────────────────────────────────────────

@app.route("/api/orders", methods=["POST"])
@jwt_required()
def create_order():
    identity = get_identity()
    data = request.json
    order_id = str(uuid.uuid4())

    conn = get_db()
    cur = conn.cursor()

    total = 0
    for item in data["items"]:
        cur.execute("SELECT price FROM products WHERE id = %s", (item["product_id"],))
        row = cur.fetchone()
        if not row:
            conn.close()
            return jsonify({"message": f"Product {item['product_id']} not found"}), 404
        price = float(row[0])
        total += price * item["quantity"]
        cur.execute(
            """INSERT INTO order_items (id, order_id, product_id, quantity, price)
               VALUES (%s,%s,%s,%s,%s)""",
            (str(uuid.uuid4()), order_id, item["product_id"], item["quantity"], price)
        )

    cur.execute(
        "INSERT INTO orders (id, buyer_id, total, address) VALUES (%s,%s,%s,%s)",
        (order_id, identity["id"], total, data.get("address", ""))
    )
    conn.commit()
    conn.close()
    return jsonify({"id": order_id, "total": total, "status": "pending"}), 201


@app.route("/api/orders/my", methods=["GET"])
@jwt_required()
def my_orders():
    identity = get_identity()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, total, status, address, created_at FROM orders WHERE buyer_id = %s ORDER BY created_at DESC",
        (identity["id"],)
    )
    rows = cur.fetchall()
    conn.close()

    return jsonify([{
        "id": r[0], "total": float(r[1]), "status": r[2],
        "address": r[3] or "", "createdAt": str(r[4]),
        "items": [], "buyerId": identity["id"], "buyerName": ""
    } for r in rows])


@app.route("/api/orders/farmer", methods=["GET"])
@jwt_required()
def farmer_orders():
    identity = get_identity()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT DISTINCT o.id, o.total, o.status, o.created_at, u.name
           FROM orders o
           JOIN order_items oi ON o.id = oi.order_id
           JOIN products p    ON oi.product_id = p.id
           JOIN users u       ON o.buyer_id = u.id
           WHERE p.farmer_id = %s
           ORDER BY o.created_at DESC""",
        (identity["id"],)
    )
    rows = cur.fetchall()
    conn.close()

    return jsonify([{
        "id": r[0], "total": float(r[1]), "status": r[2],
        "createdAt": str(r[3]), "buyerName": r[4],
        "items": [], "buyerId": "", "address": ""
    } for r in rows])


@app.route("/api/orders/<order_id>/status", methods=["PATCH"])
@jwt_required()
def update_order_status(order_id):
    data = request.json
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE orders SET status = %s WHERE id = %s",
        (data["status"], order_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Status updated"})


# ─── Start ────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    print("🌾 FarmFresh API running at http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
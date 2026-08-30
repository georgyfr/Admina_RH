#!/usr/bin/env python3
"""Execute data corrections via PostgREST API."""
import requests
import json

BASE = 'https://aywwakllgvfoqlpowzqf.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5d3dha2xsZ3Zmb3FscG93enFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ5OTczMywiZXhwIjoyMTAwMDc1NzMzfQ.IjhuIO0G8bDYnYgU_0jmEAPXd_1bdDm7kzVK9rdGS5E'
HEADERS = {
    'apikey': KEY,
    'Authorization': f'Bearer {KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

def fix_hotel_emails():
    """Fix @hotel.com emails in employees table (Phase 3.1 correction)."""
    print('=== Fixing @hotel.com emails in employees ===')
    resp = requests.get(f'{BASE}/rest/v1/employees?select=id,email&email=like.*@hotel.com', headers=HEADERS)
    if resp.status_code == 200:
        hotel_emails = resp.json()
        print(f'Found {len(hotel_emails)} employees with @hotel.com emails')
        for emp in hotel_emails:
            new_email = emp['email'].replace('@hotel.com', '@admina-rh.demo')
            update = requests.patch(
                f'{BASE}/rest/v1/employees?id=eq.{emp["id"]}',
                headers=HEADERS,
                json={'email': new_email}
            )
            status = 'OK' if update.status_code in (200, 204) else f'FAIL ({update.status_code})'
            print(f'  {emp["email"]} -> {new_email} [{status}]')
    else:
        print(f'Error reading employees: {resp.status_code} {resp.text[:200]}')

def verify_admina_users():
    """Verify current state of admina_users."""
    print('\n=== Admina Users State ===')
    resp = requests.get(f'{BASE}/rest/v1/admina_users?select=id,email,role,is_active&order=role', headers=HEADERS)
    if resp.status_code == 200:
        users = resp.json()
        print(f'Total users: {len(users)}')
        for u in users:
            active = '✓' if u['is_active'] else '✗'
            print(f'  [{active}] {u["role"]:15s} {u["email"]}')
    else:
        print(f'Error: {resp.status_code}')

def verify_employees():
    """Verify employees table."""
    print('\n=== Employees State ===')
    resp = requests.get(f'{BASE}/rest/v1/employees?select=id,nom,prenom,email,statut&limit=20', headers=HEADERS)
    if resp.status_code == 200:
        emps = resp.json()
        print(f'Total shown: {len(emps)}')
        hotel_count = sum(1 for e in emps if '@hotel.com' in (e.get('email') or ''))
        print(f'Still with @hotel.com: {hotel_count}')
        for e in emps[:5]:
            print(f'  {e["prenom"]} {e["nom"]} - {e.get("email", "N/A")} [{e.get("statut", "?")}]')
        if len(emps) > 5:
            print(f'  ... and {len(emps) - 5} more')
    else:
        print(f'Error: {resp.status_code}')

if __name__ == '__main__':
    verify_admina_users()
    verify_employees()
    fix_hotel_emails()
    print('\n=== Post-fix verification ===')
    verify_employees()
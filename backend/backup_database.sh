#!/bin/bash

set -e  

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DB_PATH="$SCRIPT_DIR/instance/foundation_complete.db"
BACKUP_DIR="${1:-$SCRIPT_DIR/backups}"


mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/foundation_complete_backup_${TIMESTAMP}.db"
BACKUP_SQL="$BACKUP_DIR/foundation_complete_backup_${TIMESTAMP}.sql"

echo " Foundation Database Backup"
echo "================================"
echo "Database: $DB_PATH"
echo "Backup Directory: $BACKUP_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database file not found: $DB_PATH"
    exit 1
fi

echo "Creating backup copy..."
cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Binary backup created: $BACKUP_FILE"
    ls -lh "$BACKUP_FILE"
else
    echo "❌ Backup failed"
    exit 1
fi

echo "⏳ Creating SQL dump..."
sqlite3 "$DB_PATH" ".dump" > "$BACKUP_SQL"

if [ $? -eq 0 ]; then
    echo "✅ SQL dump created: $BACKUP_SQL"
    ls -lh "$BACKUP_SQL"
else
    echo "❌ SQL dump failed"
    exit 1
fi


echo ""
echo "📋 Recent backups:"
ls -lht "$BACKUP_DIR"/foundation_complete_backup_* 2>/dev/null | head -5

METADATA_FILE="$BACKUP_DIR/foundation_complete_backup_${TIMESTAMP}.metadata"
cat > "$METADATA_FILE" << EOF
Backup Metadata
===============
Timestamp: $TIMESTAMP
Source Database: $DB_PATH
Backup Directory: $BACKUP_DIR
Binary Backup: $BACKUP_FILE
SQL Dump: $BACKUP_SQL

Restore Instructions:
1. Binary restore: cp $BACKUP_FILE $DB_PATH
2. SQL restore: sqlite3 $DB_PATH < $BACKUP_SQL

Backup Size:
Binary: $(du -h "$BACKUP_FILE" | cut -f1)
SQL: $(du -h "$BACKUP_SQL" | cut -f1)
EOF

echo ""
echo "✅ Backup completed successfully!"
echo "📄 Metadata: $METADATA_FILE"

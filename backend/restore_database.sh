#!/bin/bash


set -e  
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DB_PATH="$SCRIPT_DIR/instance/foundation_complete.db"

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <backup_file> [--force]"
    echo ""
    echo "Available backups:"
    ls -lht "$SCRIPT_DIR"/backups/foundation_complete_backup_*.db 2>/dev/null | head -5
    exit 1
fi

BACKUP_FILE="$1"
FORCE_RESTORE="${2:-}"

echo "🔄 Foundation Database Restore"
echo "================================"
echo "Current Database: $DB_PATH"
echo "Backup File: $BACKUP_FILE"
echo ""

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

if [ -f "$DB_PATH" ]; then
    if [ "$FORCE_RESTORE" != "--force" ]; then
        echo "⚠️  Current database will be overwritten!"
        echo "Files to be backed up:"
        ls -lh "$DB_PATH"
        echo ""
        read -p "Continue? (yes/no): " -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            echo "❌ Restore cancelled"
            exit 1
        fi
    fi
    
    SAFETY_BACKUP="$SCRIPT_DIR/instance/foundation_complete_pre_restore_$(date +%s).db"
    echo "⏳ Creating safety backup of current database..."
    cp "$DB_PATH" "$SAFETY_BACKUP"
    echo "✅ Safety backup created: $SAFETY_BACKUP"
fi


echo "⏳ Restoring from backup..."
cp "$BACKUP_FILE" "$DB_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
    echo ""
    echo "📊 Restored database info:"
    ls -lh "$DB_PATH"
    
    echo ""
    echo "⏳ Verifying database integrity..."
    if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
        echo "✅ Database integrity check passed"
    else
        echo "❌ Database integrity check failed!"
        echo "⚠️  Attempting to restore from safety backup..."
        if [ -f "$SAFETY_BACKUP" ]; then
            cp "$SAFETY_BACKUP" "$DB_PATH"
            echo "✅ Restored from safety backup"
        fi
        exit 1
    fi
else
    echo "❌ Restore failed"
    exit 1
fi

echo ""
echo "✅ Restore completed successfully!"
echo "⚠️  Please restart the application to use the restored database"

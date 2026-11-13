#!/bin/sh
# Show all Bangkok Sidekick feedback (newest first). Needs the admin key in ~/.bkk-feedback/admin_key (never commit it).
# Usage: tools/feedback.sh          -> readable list
#        tools/feedback.sh --json   -> raw JSON
KEY=$(cat "$HOME/.bkk-feedback/admin_key" 2>/dev/null) || { echo "No admin key at ~/.bkk-feedback/admin_key"; exit 1; }
URL="https://bangkok-sidekick-feedback.bangkok-sidekick-chat-proxy.workers.dev/export"
OUT=$(curl -s -H "authorization: Bearer $KEY" "$URL")
[ "$1" = "--json" ] && { echo "$OUT"; exit 0; }
echo "$OUT" | python3 "$(dirname "$0")/feedback_view.py"

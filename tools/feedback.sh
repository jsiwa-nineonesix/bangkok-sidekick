#!/bin/sh
# Show all Bangkok Sidekick feedback (newest first). Needs the admin key in ~/.bkk-feedback/admin_key (never commit it).
# Usage: tools/feedback.sh          -> readable list
#        tools/feedback.sh --json   -> raw JSON
#        tools/feedback.sh hide 12  -> hide comment #12 from the in-app board (unhide 12 to bring it back)
KEY=$(cat "$HOME/.bkk-feedback/admin_key" 2>/dev/null) || { echo "No admin key at ~/.bkk-feedback/admin_key"; exit 1; }
URL="https://bangkok-sidekick-feedback.bangkok-sidekick-chat-proxy.workers.dev/export"
if [ "$1" = "hide" ] || [ "$1" = "unhide" ]; then
  H=1; [ "$1" = "unhide" ] && H=0
  curl -s -X POST -H "authorization: Bearer $KEY" -H "content-type: application/json" -d "{\"id\":$2,\"hidden\":$H}" "${URL%/export}/admin/hide"; echo; exit 0
fi
OUT=$(curl -s -H "authorization: Bearer $KEY" "$URL")
[ "$1" = "--json" ] && { echo "$OUT"; exit 0; }
echo "$OUT" | python3 "$(dirname "$0")/feedback_view.py"

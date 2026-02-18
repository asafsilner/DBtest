#!/bin/bash

# Gmail Organization CLI Wrapper
# Provides easy-to-use commands for email organization

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ORGANIZER_PATH="$SCRIPT_DIR/gmail-organizer.js"
CONFIG_PATH="$SCRIPT_DIR/gmail-config.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
  echo -e "${BLUE}📧 Gmail Organizer${NC}"
  echo "================================"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

show_usage() {
  print_header
  echo
  echo "Usage: $0 [COMMAND] [OPTIONS]"
  echo
  echo "Commands:"
  echo "  organize         Run full email organization"
  echo "  dry-run          Test organization without making changes"
  echo "  config           Edit organization configuration"
  echo "  status           Show organization statistics"
  echo "  reset            Reset labels and configuration"
  echo "  help             Show this help message"
  echo
  echo "Options:"
  echo "  --batch-size N   Process N emails at a time (default: 100)"
  echo "  --dry-run        Test mode (no changes)"
  echo "  --verbose        Show detailed output"
  echo
  echo "Examples:"
  echo "  $0 organize                    # Full organization"
  echo "  $0 organize --dry-run          # Test first"
  echo "  $0 config                      # Edit rules"
  echo "  $0 organize --batch-size 50    # Process 50 at a time"
  echo
}

# Check prerequisites
check_requirements() {
  if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js v14 or higher."
    exit 1
  fi

  if [ ! -f "$ORGANIZER_PATH" ]; then
    print_error "Organizer script not found at: $ORGANIZER_PATH"
    exit 1
  fi

  if [ ! -f "$CONFIG_PATH" ]; then
    print_error "Configuration file not found at: $CONFIG_PATH"
    echo "Run '$0 config' to create one."
    exit 1
  fi
}

# Run organization
run_organize() {
  print_header
  echo
  print_warning "Starting Gmail organization..."
  echo

  node "$ORGANIZER_PATH" "$@"

  if [ $? -eq 0 ]; then
    echo
    print_success "Organization completed!"
  else
    print_error "Organization failed!"
    exit 1
  fi
}

# Run dry run (test mode)
run_dry_run() {
  print_header
  echo
  print_warning "Starting test run (no changes will be made)..."
  echo

  DRY_RUN=true node "$ORGANIZER_PATH" "$@"

  echo
  print_success "Test run completed! Review the changes above before running 'organize'."
}

# Edit configuration
edit_config() {
  print_header
  echo
  echo "Opening configuration file: $CONFIG_PATH"
  echo

  # Try common editors
  if command -v nano &> /dev/null; then
    nano "$CONFIG_PATH"
  elif command -v vim &> /dev/null; then
    vim "$CONFIG_PATH"
  elif command -v vi &> /dev/null; then
    vi "$CONFIG_PATH"
  else
    print_error "No text editor found (nano, vim, vi)"
    echo "Please edit manually: $CONFIG_PATH"
    exit 1
  fi

  echo
  print_success "Configuration updated!"
}

# Show statistics
show_status() {
  print_header
  echo
  echo "Configuration Status:"
  echo "  Config file: $CONFIG_PATH"

  if [ -f "$CONFIG_PATH" ]; then
    echo
    echo "Configured Rules:"
    node -e "
      const config = require('$CONFIG_PATH');
      console.log('  Label Rules: ' + config.labelRules?.length || 0);
      console.log('  Routing Rules: ' + Object.keys(config.routingRules || {}).length);
      console.log('  Important Senders: ' + (config.importantSenders || []).length);
      console.log('  Archive After: ' + (config.archiveAfterDays || 30) + ' days');
    " || echo "  (Error reading config)"
  fi

  echo
}

# Reset configuration
reset_config() {
  print_header
  echo
  print_warning "This will reset all organization rules and delete labels!"
  read -p "Are you sure? (yes/no): " confirm

  if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
  fi

  # Create backup
  BACKUP_PATH="${CONFIG_PATH}.backup.$(date +%s)"
  cp "$CONFIG_PATH" "$BACKUP_PATH"
  print_success "Backup created: $BACKUP_PATH"

  # Reset config
  cat > "$CONFIG_PATH" << 'EOF'
{
  "labelRules": [],
  "archiveAfterDays": 30,
  "spamPatterns": [],
  "importantSenders": [],
  "routingRules": {}
}
EOF

  print_success "Configuration reset!"
}

# Main logic
main() {
  local command="${1:-help}"

  case "$command" in
    organize)
      check_requirements
      run_organize "${@:2}"
      ;;
    dry-run|test)
      check_requirements
      run_dry_run "${@:2}"
      ;;
    config)
      check_requirements
      edit_config
      ;;
    status)
      check_requirements
      show_status
      ;;
    reset)
      check_requirements
      reset_config
      ;;
    help|--help|-h)
      show_usage
      ;;
    *)
      print_error "Unknown command: $command"
      echo
      show_usage
      exit 1
      ;;
  esac
}

# Run main
main "$@"

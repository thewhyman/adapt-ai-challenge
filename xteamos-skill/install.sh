#!/usr/bin/env bash
# xTeamOS Skill Installer
#
# Installs two Claude Code skills and creates incarnation workspaces.
#
# Skills installed:
#   ~/.claude/skills/xos-base/SKILL.md   — Ingestion + Extraction + Persona engines
#   ~/.claude/skills/xteamos/SKILL.md    — Campaign engine (uses xos-base)
#
# Usage:
#   bash install.sh                   # install skills only
#   bash install.sh --gaia            # install skills + Gaia Dynamics workspace
#   bash install.sh --meta            # install skills + Meta workspace  
#   bash install.sh --all             # install skills + all incarnations
#   bash install.sh --uninstall       # remove both skills
#
# No server required. Skills call https://adapt-ai-challenge.vercel.app by default.
# Neo4j is SaaS Aura — wired into the API layer, invisible to skills.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$HOME/.claude/skills"

GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${BLUE}[xTeamOS]${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠${NC} $*"; }
err()     { echo -e "${RED}✗${NC} $*" >&2; exit 1; }

# ── Uninstall ─────────────────────────────────────────────────────────────────
if [[ "${1:-}" == "--uninstall" ]]; then
  rm -rf "$SKILLS_DIR/xos-base" "$SKILLS_DIR/xteamos"
  success "xos-base and xteamos skills removed."
  exit 0
fi

# ── Install skills ────────────────────────────────────────────────────────────
info "Installing xos-base kernel skill..."
[[ -f "$SCRIPT_DIR/skills/xos-base/SKILL.md" ]] || err "Missing skills/xos-base/SKILL.md"
mkdir -p "$SKILLS_DIR/xos-base"
cp "$SCRIPT_DIR/skills/xos-base/SKILL.md" "$SKILLS_DIR/xos-base/SKILL.md"
success "xos-base → $SKILLS_DIR/xos-base/SKILL.md"

info "Installing xteamos skill..."
[[ -f "$SCRIPT_DIR/skills/xteamos/SKILL.md" ]] || err "Missing skills/xteamos/SKILL.md"
mkdir -p "$SKILLS_DIR/xteamos"
cp "$SCRIPT_DIR/skills/xteamos/SKILL.md" "$SKILLS_DIR/xteamos/SKILL.md"
success "xteamos  → $SKILLS_DIR/xteamos/SKILL.md"

# ── Create incarnation workspace ──────────────────────────────────────────────
install_incarnation() {
  local name="$1"                                    # e.g. gaia-xteamos
  local src="$SCRIPT_DIR/incarnations/$name"
  local dst="$HOME/xteamos-workspaces/$name"

  [[ -d "$src" ]] || { warn "No incarnation at $src — skipping $name"; return; }

  mkdir -p "$dst/campaigns"
  cp "$src/INCARNATION.md" "$dst/INCARNATION.md"
  cp "$src/CLAUDE.md"      "$dst/CLAUDE.md" 2>/dev/null || true

  success "$name workspace → $dst"
  echo ""
  echo "  To run:"
  echo "    cd $dst && claude"
  echo "    > run campaign for https://gaiadynamics.ai/tariff-engine"
  echo ""
}

for arg in "$@"; do
  case "$arg" in
    --gaia) install_incarnation "gaia-xteamos" ;;
    --meta) install_incarnation "meta-xteamos" ;;
    --all)  install_incarnation "gaia-xteamos"
            install_incarnation "meta-xteamos" ;;
  esac
done

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━ xTeamOS ready ━━━${NC}"
echo ""
echo "Skills installed:"
echo "  xos-base  — Ingestion + Extraction + Persona engines"
echo "  xteamos   — Campaign engine (calls Vercel API + Neo4j Aura)"
echo ""
echo "API: https://adapt-ai-challenge.vercel.app (no local server needed)"
echo "DB:  Neo4j Aura SaaS (wired in the API layer)"
echo ""
echo "To create a new incarnation workspace:"
echo "  mkdir my-company && cd my-company"
echo "  echo '---' > INCARNATION.md"
echo "  echo 'company_name: My Company' >> INCARNATION.md"
echo "  echo 'company_url: https://mycompany.com' >> INCARNATION.md"
echo "  echo 'api_base: https://adapt-ai-challenge.vercel.app' >> INCARNATION.md"
echo "  echo 'output_dir: ./campaigns' >> INCARNATION.md"
echo "  echo '---' >> INCARNATION.md"
echo "  claude"
echo "  > run campaign for https://mycompany.com/launch"
echo ""

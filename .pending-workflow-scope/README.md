# Workflow files held back until gh auth has the workflow scope.
# Run: gh auth refresh -h github.com -s workflow
# Then: mv .pending-workflow-scope/lint-naming.yml .github/workflows/
# And:  git rm -r .pending-workflow-scope && git add .github/workflows/lint-naming.yml && git commit -m "ci: re-add lint-naming workflow"

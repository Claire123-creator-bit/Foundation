# TODO - Ensure no DB/media loss

- [ ] Step 1: Verify/enforce SQLite DB path used by the Flask app (match backend/instance/foundation_complete.db)
- [ ] Step 2: Add DB upload failure cleanup: if Cloudinary upload succeeds but DB commit fails, delete the uploaded Cloudinary asset.
- [ ] Step 3: Make media delete consistent: mark/delete in DB first (commit), then delete from Cloudinary; rollback safety and logging.
- [ ] Step 4: Add/extend backend tests to cover upload + delete failure modes (mock Cloudinary).
- [ ] Step 5: Run backend tests.
- [ ] Step 6: Run backup/restore smoke test and verify media + DB consistency.


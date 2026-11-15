from pathlib import Path
import importlib.util
import json
import tempfile
import unittest
import zipfile

ROOT=Path(__file__).resolve().parents[2]
SPEC=importlib.util.spec_from_file_location('package_skills',ROOT/'scripts/package_claude_skills.py')
mod=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)


class PackagingTests(unittest.TestCase):
    def test_bundle_is_self_contained_and_manifest_matches(self):
        with tempfile.TemporaryDirectory() as temp:
            manifest=mod.build_package(ROOT,Path(temp))
            self.assertEqual(manifest['schema'],'weg-manager.skill-packages/v1')
            item=manifest['skills'][0]
            archive=Path(temp)/item['archive']
            self.assertEqual(mod.sha256(archive.read_bytes()),item['sha256'])
            with zipfile.ZipFile(archive) as z:
                names=set(z.namelist())
                self.assertIn('weg-gmail-to-vault/SKILL.md',names)
                self.assertIn('weg-gmail-to-vault/scripts/import_messages.py',names)
                self.assertIn('weg-gmail-to-vault/references/email-note-schema.md',names)
                self.assertIn('weg-gmail-to-vault/LICENSE',names)
                self.assertTrue(all(n.startswith('weg-gmail-to-vault/') for n in names))
                self.assertFalse(any('..' in Path(n).parts or '__pycache__' in n or n.endswith('.pyc') for n in names))
            self.assertEqual(json.loads((Path(temp)/'manifest.json').read_text(encoding='utf-8')),manifest)

    def test_reproducible_archive(self):
        with tempfile.TemporaryDirectory() as temp:
            one=mod.build_package(ROOT,Path(temp)/'one')
            two=mod.build_package(ROOT,Path(temp)/'two')
            self.assertEqual(one['skills'][0]['sha256'],two['skills'][0]['sha256'])


if __name__=='__main__': unittest.main()

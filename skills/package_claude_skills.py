"""Build the distributable Claude skill; does not install or connect any service."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

SKILL_NAME='weg-gmail-to-vault'
VERSION='0.1.0'


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def build_package(repo, output):
    repo=Path(repo).resolve(); output=Path(output).resolve()
    source=repo/'skills'/SKILL_NAME
    required=['SKILL.md','LICENSE','scripts/import_messages.py',
              'references/email-note-schema.md','references/runtime-and-installation.md']
    for name in required:
        target=source/name
        if not target.is_file() or target.is_symlink() or not target.resolve().is_relative_to(source):
            raise ValueError('Missing or unsafe skill resource: '+name)
    (output/'dist').mkdir(parents=True,exist_ok=True)
    archive=output/'dist'/(SKILL_NAME+'-'+VERSION+'.zip')
    # Stored, not deflated: deflate output differs between zlib builds, so a compressed archive
    # (and the checksum in manifest.json) would depend on the machine that built it.
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_STORED) as bundle:
        for name in sorted(required):
            entry=zipfile.ZipInfo(SKILL_NAME+'/'+name,date_time=(2026,11,15,0,0,0))
            entry.compress_type=zipfile.ZIP_STORED
            entry.external_attr=0o100644 << 16
            bundle.writestr(entry,(source/name).read_bytes())
    manifest={
        'schema':'weg-manager.skill-packages/v1',
        'skills':[{
            'id':SKILL_NAME,'version':VERSION,'title':'Gmail-Nachrichten in den WEG-Vault übernehmen',
            'source':SKILL_NAME+'/', 'entrypoint':'SKILL.md',
            'archive':archive.relative_to(output).as_posix(),
            'sha256':sha256(archive.read_bytes()),'size_bytes':archive.stat().st_size,
            'license':'MIT',
            'capabilities_required':['existing-gmail-search-and-read-connector','user-granted-vault-write-access','python-3.10-or-newer'],
            'mailbox_access':'read-only-workflow',
            'installation_modes':[
                {'mode':'claude-code-project-folder','destination':'.claude/skills/'+SKILL_NAME,'behavior':'user-selected project or vault; existing files must be compared before update'},
                {'mode':'claude-custom-skill-upload','artifact':'zip-with-single-skill-root','behavior':'provide archive to user; no universal account-side installation API assumed'}
            ],
            'plugin_installer_status':'specified-not-implemented',
            'live_claude_gmail_validation':'not-performed'
        }]
    }
    (output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    return manifest


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir',type=Path)
    args=parser.parse_args()
    root=Path(__file__).resolve().parents[1]
    output=args.output_dir or root/'skills'
    result=build_package(root,output)
    print(json.dumps(result,ensure_ascii=True,indent=2))


if __name__=='__main__': main()

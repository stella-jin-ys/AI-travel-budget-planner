def test_cli_module_exposes_expected_commands():
    from commercepulse.cli import build_parser

    parser = build_parser()
    subparsers = parser._subparsers._group_actions[0].choices
    assert {"generate", "build", "validate"}.issubset(subparsers)

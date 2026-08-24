import argparse
from pathlib import Path

from commercepulse.config import ProjectPaths


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="commercepulse")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("generate", help="Generate raw ecommerce data")
    subparsers.add_parser("build", help="Build the warehouse and marts")
    subparsers.add_parser("validate", help="Run data quality checks")

    return parser


def main() -> None:
    parser = build_parser()
    parser.parse_args()


if __name__ == "__main__":
    main()


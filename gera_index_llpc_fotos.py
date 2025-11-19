from pathlib import Path
import csv

# pasta do repositório (ajuste se o nome for diferente)
root = Path("llpc-fotos")

output_csv = Path("llpc-fotos-index.csv")

with output_csv.open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    # cabeçalho
    writer.writerow(["path", "nome_arquivo"])

    for file_path in root.rglob("*"):
        if file_path.is_file():
            # caminho relativo dentro do repo
            rel_path = file_path.relative_to(root).as_posix()
            nome_arquivo = file_path.name
            writer.writerow([rel_path, nome_arquivo])

print(f"Arquivo CSV gerado: {output_csv.resolve()}")

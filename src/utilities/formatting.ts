import { ColumnDescription } from "../cloud";

export function leftJustify(text: string, width: number) {
    if (text.length >= width) {
        return text;
    } else {
        const paddingWidth = width - text.length;
        const padding = new Array(paddingWidth + 1).join(' ');
        return text + padding;
    }
}

export function rightJustify(text: string, width: number) {
    if (text.length >= width) {
        return text;
    } else {
        const paddingWidth = width - text.length;
        const padding = new Array(paddingWidth + 1).join(' ');
        return padding + text;
    }
}

export function* formatTable(
    alignments: string[],
    rows: string[][]
): IterableIterator<string> {
    const widths = new Array(alignments.length).fill(0);
    for (const row of rows) {
        for (let i = 0; i < row.length; ++i) {
            widths[i] = Math.max(widths[i], row[i].length);
        }
    }
    for (const row of rows) {
        const fields = row.map((column, i) => {
            if (alignments[i] === 'left') {
                return leftJustify(row[i], widths[i]);
            } else if (alignments[i] === 'right') {
                return rightJustify(row[i], widths[i]);
            } else {
                return row[i];
            }
        });

        yield fields.join('   ');
    }
}

export function* formatTable2(
    columns: ColumnDescription[],
    // tslint:disable-next-line:no-any
    data: any[][]
): IterableIterator<string> {
    const alignments = columns.map(
        column => (column.type === 'number') ? 'right' : 'left'
    );

    const rows: string[][] = [
        columns.map(column => column.name)
    ];

    for (const row of data) {
        rows.push(row.map(x => x.toString()));
    }

    yield* formatTable(alignments, rows);
}

'use strict';
const fs   = require('fs');
const path = require('path');
const util = require('util');
const zlib = require('zlib');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function rel(p) {
    return path.relative(PROJECT_ROOT, p);
}

function kb(bytes) {
    return (bytes / 1024).toFixed(1);
}

function ratio(beforeBytes, afterBytes) {
    const ratioPct  = (afterBytes / beforeBytes) * 100;
    const delta     = ratioPct - 100;
    const deltaText = delta <= 0
        ? `${delta.toFixed(1)}%`
        : `+${delta.toFixed(1)}% larger`;
    return { ratioPct, deltaText };
}

function sizeOrDie(p) {
    if (!fs.existsSync(p)) {
        console.error(`  missing: ${rel(p)}`);
        process.exit(1);
    }
    return fs.statSync(p).size;
}

function cmdCompare(beforePath, afterPath, label) {
    if (!beforePath || !afterPath || !label) {
        console.error('  usage: report-sizes.js compare <before> <after> <label>');
        process.exit(1);
    }
    const beforeBytes        = sizeOrDie(path.resolve(PROJECT_ROOT, beforePath));
    const afterBytes         = sizeOrDie(path.resolve(PROJECT_ROOT, afterPath));
    const { ratioPct, deltaText } = ratio(beforeBytes, afterBytes);
    console.log(util.format(
        '  %s: %s KB → %s KB (%s%% of original, %s)',
        label,
        kb(beforeBytes).padStart(6, ' '),
        kb(afterBytes).padStart(6, ' '),
        ratioPct.toFixed(1).padStart(5, ' '),
        deltaText
    ));
}

function cmdSummary(patterns) {
    if (patterns.length === 0) {
        console.error('  usage: report-sizes.js summary <path-or-glob>...');
        process.exit(1);
    }
    const matches = [];
    for (const pat of patterns) {
        const found = fs.globSync(pat, { cwd: PROJECT_ROOT });
        if (found.length === 0) {
            console.error(`  (no files matched: ${pat})`);
            process.exit(1);
        }
        for (const m of found) {
            matches.push(path.resolve(PROJECT_ROOT, m));
        }
    }
    matches.sort();
    const names = matches.map(rel);
    const padTo = Math.max('total (css + js)'.length, ...names.map(n => n.length));

    function logRow(label, rawBytes, gzipBytes) {
        const diffKb = Math.abs(gzipBytes - rawBytes) / 1024;
        if (diffKb <= 0.1) {
            console.log(util.format(
                '  %s %s KB → %s KB gzipped (same size)',
                label.padEnd(padTo, ' '),
                kb(rawBytes).padStart(6, ' '),
                kb(gzipBytes).padStart(6, ' ')
            ));
            return;
        }
        const { ratioPct, deltaText } = ratio(rawBytes, gzipBytes);
        console.log(util.format(
            '  %s %s KB → %s KB gzipped (%s%% of original, %s)',
            label.padEnd(padTo, ' '),
            kb(rawBytes).padStart(6, ' '),
            kb(gzipBytes).padStart(6, ' '),
            ratioPct.toFixed(1).padStart(5, ' '),
            deltaText
        ));
    }

    let totalRaw   = 0;
    let totalGzip  = 0;
    let codeRaw    = 0;
    let codeGzip   = 0;
    for (let i = 0; i < matches.length; i++) {
        const buf       = fs.readFileSync(matches[i]);
        const rawBytes  = buf.length;
        const gzipBytes = zlib.gzipSync(buf).length;
        totalRaw  += rawBytes;
        totalGzip += gzipBytes;
        const ext = path.extname(matches[i]).toLowerCase();
        if (ext === '.css' || ext === '.js') {
            codeRaw  += rawBytes;
            codeGzip += gzipBytes;
        }
        logRow(names[i], rawBytes, gzipBytes);
    }
    if (codeRaw > 0) {
        logRow('total (css + js)', codeRaw, codeGzip);
    }
    logRow('total', totalRaw, totalGzip);
}

const [mode, ...rest] = process.argv.slice(2);
switch (mode) {
    case 'compare':
        cmdCompare(rest[0], rest[1], rest.slice(2).join(' '));
        break;
    case 'summary':
        cmdSummary(rest);
        break;
    default:
        console.error('  usage: report-sizes.js compare <before> <after> <label> | summary <glob>...');
        process.exit(1);
}

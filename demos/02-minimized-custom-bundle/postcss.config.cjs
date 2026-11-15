'use strict';
const purgecss = require('@fullhuman/postcss-purgecss');
const cssnano  = require('cssnano');
const config   = require('./build.config.cjs');

const skipPurge = process.env.SKIP_PURGECSS === '1';
if (skipPurge) {
    console.log('  postcss: skipping purgecss (SKIP_PURGECSS=1)');
}

module.exports = {
    plugins: [
        ...(skipPurge ? [] : [purgecss({
            content:   config.treeShaking.content,
            variables: true,
            safelist:  config.treeShaking.safelist,
        })]),
        cssnano({ preset: 'default' }),
    ],
};

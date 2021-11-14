import * as fs from 'fs';
import * as path from 'path';
import * as nedb from '@sailshq/nedb';
import { Cursor } from 'nedb';

export const storage = new nedb({
    filename: path.join(__dirname, '../data/storage.db'),
    autoload: true,
}) as Nedb;

storage.persistence.setAutocompactionInterval(3 * 60 * 1e3);

//
// 需要保存的配置
// views
// active views
// view layouts
//

function create_updates(data) {
    const updates: { [k: string]: any } = {};
    if (typeof data === 'object') {

        for (const k in data) {
            if (typeof data[k] !== 'object') {
                updates[k] = data[k];
            } else {

                for (const m in data[k]) {
                    updates[k + '.' + m] = data[k][m];
                }
                if ('length' in data[k]) {
                    updates[k + '.' + 'length'] = data[k].length;
                }
            }
        }
        if ('length' in data) {
            updates.length = data.length;
        }
    } else if (typeof data === 'string') {
        updates.code = data;
    }
    return updates;
}
export interface LogView {
    name: string;
    pathname: string;
    keywords: string[];
}

export function addView(done, view?: LogView) {
    const note = {
        timestamp: Date.now(),
        type: 'view',
        name: 'untitled',
        pathname: '',
        highlights: [],
        ...view,
    };
    storage.insert(note, done);
}

export function removeView(id, done) {
    storage.remove({ _id: id }, done);
}
export function get(id, done) {
    storage.findOne({
        _id: id,
    }, done);
}

export function getViews(done, defaultViews?: LogView[]) {
    storage.find({ type: 'view' })
        .sort({ timestamp: -1 })
        .exec(function (err, notes) {
            if (err) { return done(err); }
            if (!notes || !notes.length) {
                if (defaultViews) {
                    Promise.all(defaultViews.map(v => addView(null, v))).then((views) => {
                        done(null, views);
                    });
                } else {

                    addView(function (addViewErr, note) {
                        done(addViewErr, [note]);
                    });
                }

            } else {
                done(err, notes);
            }
        });
}

export function getLayout(done) {
    (storage.findOne as (query: any) => Cursor<any>)({ type: 'layout' })
        .exec(function (err, layout) {
            if (err) { return done(err); }
            done(err, layout || {});
        });
}

export function updateLayout(data, done) {
    const updates = create_updates(data);

    updates.timestamp = Date.now();
    updates.type = 'layout';

    storage.update({ type: 'layout' }, { $set: updates }, { upsert: true }, done);
}

export function update(id, data, done) {
    const updates = create_updates(data);

    updates.timestamp = Date.now();
    storage.update({ _id: id }, { $set: updates }, done);
}



export function remove(id, done) {
    storage.remove({ _id: id }, done);
}

import * as fs from 'fs';
import * as path from 'path';
import * as nedb from 'nedb';
import { Cursor } from 'nedb';

const storage = new nedb({
    filename: path.join(__dirname, '../data/storage.db'),
    autoload: true,
});

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

export = {
    addView(done) {
        const note = {
            timestamp: Date.now(),
            type: 'view',
            name: 'untitled',
            pathname: '',
            highlights: [],
        };
        storage.insert(note, done);
    },

    removeView(id, done) {
        storage.remove({ _id: id }, done);
    },
    get(id, done) {
        storage.findOne({
            _id: id,
        }, done);
    },

    getViews(done) {
        const self = this;
        storage.find({ type: 'view' })
            .sort({ timestamp: -1 })
            .exec(function (err, notes) {
                if (err) { return done(err); }
                if (!notes || !notes.length) {
                    self.addView(function (addViewErr, note) {
                        done(addViewErr, [note]);
                    });
                } else {
                    done(err, notes);
                }
            });
    },

    getLayout(done) {
        (storage.findOne as (query: any) => Cursor<any>)({ type: 'layout' })
            .exec(function (err, layout) {
                if (err) { return done(err); }
                done(err, layout || {});
            });
    },

    updateLayout(data, done) {
        const updates = create_updates(data);

        updates.timestamp = Date.now();
        updates.type = 'layout';

        storage.update({ type: 'layout' }, { $set: updates }, { upsert: true }, done);
    },

    update(id, data, done) {
        const updates = create_updates(data);

        updates.timestamp = Date.now();
        storage.update({ _id: id }, { $set: updates }, done);
    },

    storage,

    remove(id, done) {
        storage.remove({ _id: id }, done);
    },
};

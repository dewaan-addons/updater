let Updater = {}, module_name = 'updater', module_title = 'Updater',
	updater_list, updater_view_keys,
	updater_store,
	primary_dialog = 'updater-dialog';

Hooks.set('addon-activate', async function ({ uid }) { if (module_name == uid) {
	Addons.add_global(module_title, Updater);
	
	Updater.store = updater_store = Database.store(module_name, 0, {
		sync: 1,
		auto_sync: 1,
	});
	
	updater_view_keys = Views.dom_keys(module_name);
	
	Updater.list = updater_list = List(updater_view_keys.list)
						.id_prefix(module_name)
						.list_item('updater_item');
	
	updater_list.onpress = function (o, k) {
		if (['provide', 'get'].includes(o.uid)) {
			if (o.info == 'OFF') o.info = 'ON';
			else				 o.info = 'OFF';
		}
		if (o.uid == 'primary') {
			Hooks.run('dialog', {
				n: primary_dialog,
				u: 'primary',
				q: 'Primary Server',
			});
		}
		updater_list.set(o);
	};
	
	Sidebar.set({
		uid,
		title: module_title,
		icon$h: Addons.get_icon(module_name),
	});

	updater_list.set({
		uid: 'get',
		title: 'Get Updates from Hub Server',
		info: '...',
	});
	updater_list.set({
		uid: 'provide',
		title: 'Provide Updates to Other Servers',
		info: '...',
	});
	updater_list.set({
		uid: 'primary',
		title: 'Primary Hub Server URI',
		info: '...',
	});

} });

Hooks.set('view-ready', async function ({ name }) { if (Views.is_active_fully( module_name )) {
	Webapp.header([ module_title, 0, Addons.get_icon(name) ]);

	Sidebar.choose(name);
	updater_list.select();

	Softkeys.add({ n: 'Check',
		i: 'iconadd',
		k: K.sl, // soft left key
		c: function () {
		},
	});
} });

Hooks.set(dialog_done, async function ({ name, uid }, k, answer) { if (name == primary_dialog) {
	if (updater_list) {
		updater_list.set({
			uid,
			info: answer || '...',
		});
		updater_store.set({
			uid,
			answer,
			pending: 1,
		});
	}
} });

Hooks.set('addon-deactivate', function ({ uid }) { if (module_name == uid) {
	if (updater_list) updater_list.destroy();
	Sidebar.remove(uid);
} });





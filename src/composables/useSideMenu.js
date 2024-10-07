import {toRef, ref, computed} from 'vue';
import {useQueryParams} from '@/composables/useQueryParams';

export function useSideMenu(_items, opts = {}) {
	const queryParams = useQueryParams();

	const _activeItemKey = opts.activeItemKey || '';
	const _expandedKeys = opts.expandedKeys || {};
	const onActionFn = opts.onActionFn || (() => {});
	const itemsRef = toRef(_items);

	if (typeof itemsRef.value === 'undefined') {
		throw new Error('items must be provided to use this api');
	}
	const items = computed(() => {
		return mapItems(itemsRef.value);
	});
	const expandedKeys = ref(_expandedKeys);
	const activeItemKey = ref(_activeItemKey);

	function updateExpandedKeys(_expandedKeys) {
		expandedKeys.value = _expandedKeys;
	}

	function findItemByKey(items, key) {
		if (!items?.length || !key) {
			return null;
		}

		for (const item of items) {
			// Check if the current item matches the key
			if (item.key === key) {
				return item;
			}

			// If the item has nested items, search within them recursively
			if (item.items) {
				const foundItem = findItemByKey(item.items, key);
				if (foundItem) {
					return foundItem;
				}
			}
		}

		return null;
	}

	function setExpandedKeys(keys = []) {
		// reset expandedKeys
		expandedKeys.value = {};

		keys.forEach((key) => (expandedKeys.value[key] = true));
		return expandedKeys;
	}

	function setActiveItemKey(key = '') {
		activeItemKey.value = key;
	}

	function compareUrlPaths(url1, url2) {
		const parsedUrl1 = new URL(url1);
		const parsedUrl2 = new URL(url2);
		return (
			parsedUrl1.pathname === parsedUrl2.pathname &&
			parsedUrl1.hostname === parsedUrl2.hostname
		);
	}

	// Maps the level attributes which are necessary to render the nested menu
	function mapItems(__items, level = 1) {
		const result = [];

		__items.forEach((_item, index) => {
			const item = {
				..._item,
				level,
				index,
			};

			if (_item.items) {
				item.items = mapItems(_item.items, level + 1);
			}

			if (item.link) {
				item.command = () => {
					if (compareUrlPaths(window.location.href, item.link)) {
						// only update query params, without reloading page, important for dashboards
						const parsedUrl = new URL(item.link);
						const params = new URLSearchParams(parsedUrl.search);
						for (const [key, value] of params) {
							queryParams[key] = value;
						}
					} else {
						window.location.href = item.link;
					}
					setActiveItemKey(item.key);
				};
			}

			if (item.action) {
				item.command = () => {
					onActionFn(item.action, {...item.actionArgs, key: item.key});
					setActiveItemKey(item.key);
				};
			}

			result.push(item);
		});

		return result;
	}

	const sideMenuProps = computed(() => ({
		items: items.value,
		expandedKeys: expandedKeys.value,
		activeItemKey: activeItemKey.value,
		'onUpdate:expandedKeys': updateExpandedKeys,
		'onUpdate:activeItemKey': setActiveItemKey,
	}));

	const selectedItem = computed(() =>
		findItemByKey(items.value, activeItemKey.value),
	);

	return {
		sideMenuProps,
		updateExpandedKeys,
		setExpandedKeys,
		setActiveItemKey,
		selectedItem,
	};
}
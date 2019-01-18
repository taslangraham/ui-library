import Table from '@/components/Table/Table.vue';
import ViewTable from './ViewTable.vue';
import WithColumn from './WithColumn.vue';
import WithColumnRaw from '!!raw-loader!./WithColumn.vue';
import WithDescription from './WithDescription.vue';
import WithDescriptionRaw from '!!raw-loader!./WithDescription.vue';
import WithHeader from './WithHeader.vue';
import WithHeaderRaw from '!!raw-loader!./WithHeader.vue';
import WithLabelledBy from './WithLabelledBy.vue';
import WithLabelledByRaw from '!!raw-loader!./WithLabelledBy.vue';
import WithPagination from './WithPagination.vue';
import WithPaginationRaw from '!!raw-loader!./WithPagination.vue';
import WithSorting from './WithSorting.vue';
import WithSortingRaw from '!!raw-loader!./WithSorting.vue';

export default {
	viewComponent: ViewTable,
	baseComponent: Table,
	propDescription: {},
	examples: {
		'with-description': {
			label: 'with Description',
			component: WithDescription,
			componentRaw: WithDescriptionRaw,
		},
		'with-header': {
			label: 'with Custom Header',
			component: WithHeader,
			componentRaw: WithHeaderRaw,
		},
		'with-column': {
			label: 'with Custom Column',
			component: WithColumn,
			componentRaw: WithColumnRaw,
		},
		'with-sorting': {
			label: 'with Sorting',
			component: WithSorting,
			componentRaw: WithSortingRaw,
		},
		'with-labelled-by': {
			label: 'with Labelled By',
			component: WithLabelledBy,
			componentRaw: WithLabelledByRaw,
		},
		'with-pagination': {
			label: 'with Pagination',
			component: WithPagination,
			componentRaw: WithPaginationRaw,
		},
	},
};

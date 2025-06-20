<template>
	<PkpTable>
		<TableHeader>
			<TableColumn>{{ t('userInvitation.roleTable.role') }}</TableColumn>
			<TableColumn>{{ t('userInvitation.roleTable.startDate') }}</TableColumn>
			<TableColumn>{{ t('userInvitation.roleTable.endDate') }}</TableColumn>
			<TableColumn>
				{{ t('userInvitation.roleTable.journalMasthead') }}
			</TableColumn>
			<TableColumn></TableColumn>
		</TableHeader>
		<TableBody>
			<TableRow
				v-for="(currentUserGroup, index) in store.invitationPayload
					.currentUserGroups"
				:key="index"
				class="h-[3.25rem]"
			>
				<TableCell>
					{{ currentUserGroup.name }}
				</TableCell>
				<TableCell>
					{{
						currentUserGroup.dateStart
							? formatShortDate(currentUserGroup.dateStart)
							: '---'
					}}
				</TableCell>
				<TableCell>
					{{
						currentUserGroup.dateEnd
							? formatShortDate(currentUserGroup.dateEnd)
							: '---'
					}}
				</TableCell>
				<TableCell>
					{{
						reviewerUserGroupIds.includes(currentUserGroup.id)
							? t('invitation.masthead.show')
							: currentUserGroup.masthead
								? t('invitation.masthead.show')
								: t('invitation.masthead.hidden')
					}}
				</TableCell>
				<TableCell v-if="!currentUserGroup.dateEnd">
					<PkpButton
						:is-warnable="true"
						@click="removeUserGroup(currentUserGroup, index)"
					>
						{{ t('invitation.role.removeRole.button') }}
					</PkpButton>
				</TableCell>
				<TableCell v-else>
					<div
						class="rounded border-light bg-[#fbe7f1] px-2 py-2 text-center text-lg-semibold leading-5"
					>
						{{ t('invitation.removeRoles') }}
					</div>
				</TableCell>
			</TableRow>
			<template v-if="!store.invitationPayload.disabled">
				<TableRow
					v-for="(userGroupToAdd, index) in allUserGroupsToAdd"
					:key="index"
				>
					<TableCell>
						<FieldSelect
							name="userGroupId"
							:label="t('invitation.role.selectRole')"
							:is-required="true"
							:value="userGroupToAdd.userGroupId"
							:options="availableUserGroups"
							:all-errors="{
								userGroupId:
									userGroupErrors['userGroupsToAdd.' + index + '.userGroupId'],
							}"
							class="userInvitation__roleSelect"
							@change="
								(fieldName, propName, newValue, localeKey) =>
									updateUserGroup(index, fieldName, newValue)
							"
						/>
					</TableCell>
					<TableCell>
						<FieldText
							name="dateStart"
							:label="t('invitation.role.dateStart')"
							input-type="date"
							:is-required="true"
							:value="userGroupToAdd.dateStart"
							:all-errors="{
								dateStart:
									userGroupErrors['userGroupsToAdd.' + index + '.dateStart'],
							}"
							@change="
								(fieldName, propName, newValue, localeKey) =>
									updateUserGroup(index, fieldName, newValue)
							"
						/>
					</TableCell>
					<TableCell>---</TableCell>
					<TableCell>
						<FieldSelect
							name="masthead"
							:label="t('invitation.role.masthead')"
							:is-required="true"
							:value="userGroupToAdd.masthead"
							:options="getMastheadOption(userGroupToAdd)"
							:all-errors="{
								masthead:
									userGroupErrors['userGroupsToAdd.' + index + '.masthead'],
							}"
							@change="
								(fieldName, propName, newValue, localeKey) =>
									updateUserGroup(index, fieldName, newValue)
							"
						/>
					</TableCell>
					<TableCell>
						<PkpButton
							v-if="
								store.invitationPayload.userGroupsToAdd.length > 1 ||
								isUserGroupsToAddPopulated()
							"
							:is-warnable="true"
							@click="removeInvitedUserGroup(index)"
						>
							{{ t('invitation.role.removeRole.button') }}
						</PkpButton>
					</TableCell>
				</TableRow>
			</template>
		</TableBody>
		<template #bottom-controls>
			<PkpButton
				:is-disabled="store.invitationPayload.disabled"
				@click="addUserGroup()"
			>
				{{ t('invitation.role.addRole.button') }}
			</PkpButton>
		</template>
	</PkpTable>
</template>

<script setup>
import {computed} from 'vue';
import {useLocalize} from '@/composables/useLocalize';
import PkpTable from '@/components/Table/Table.vue';
import TableCell from '@/components/Table/TableCell.vue';
import TableHeader from '@/components/Table/TableHeader.vue';
import TableColumn from '@/components/Table/TableColumn.vue';
import TableBody from '@/components/Table/TableBody.vue';
import TableRow from '@/components/Table/TableRow.vue';
import FieldSelect from '@/components/Form/fields/FieldSelect.vue';
import PkpButton from '@/components/Button/Button.vue';
import FieldText from '@/components/Form/fields/FieldText.vue';
import {useUserInvitationPageStore} from './UserInvitationPageStore';
import {useDate} from '@/composables/useDate';
import {useModal} from '@/composables/useModal';
import {useUrl} from '@/composables/useUrl';
import {useFetch} from '@/composables/useFetch';

const props = defineProps({
	userGroups: {type: Array, required: true},
});

const {localize} = useLocalize();
const {t} = useLocalize();
const {formatShortDate} = useDate();

const reviewerUserGroupIds = computed(() =>
	props.userGroups
		.filter((userGroup) => userGroup.roleId === pkp.const.ROLE_ID_REVIEWER)
		.map((userGroup) => userGroup.userGroupId),
);

const roleOptions = computed(() =>
	props.userGroups.map((userGroup) => ({
		value: userGroup.userGroupId,
		label: localize(userGroup.name),
		disabled: false,
	})),
);

const store = useUserInvitationPageStore();

const allUserGroupsToAdd = computed(
	() => store.invitationPayload.userGroupsToAdd,
);
updateWithSelectedUserGroups(roleOptions);

/**
 * update selected user group
 * @param index Number
 * @param fieldName String
 * @param newValue String
 */
function updateUserGroup(index, fieldName, newValue) {
	delete store.errors['userGroupsToAdd.' + index + `.${fieldName}`];
	const userGroupsUpdate = [...store.invitationPayload.userGroupsToAdd];
	userGroupsUpdate[index][fieldName] = newValue;
	store.updatePayload('userGroupsToAdd', userGroupsUpdate, false);
	updateWithSelectedUserGroups(roleOptions);
}

const availableUserGroups = computed(() => {
	return roleOptions.value.filter((element) => {
		return !store.invitationPayload.currentUserGroups.find(
			(data) => data.id === element.value && !data.dateEnd,
		);
	});
});

/**
 * Masthead options
 */
function getMastheadOption(userGroupToAdd) {
	// Reviewer is always displayed on the masthead
	if (reviewerUserGroupIds.value.includes(userGroupToAdd.userGroupId)) {
		return [{label: t('invitation.masthead.show'), value: true}];
	}

	return [
		{label: t('invitation.masthead.show'), value: true},
		{label: t('invitation.masthead.hidden'), value: false},
	];
}

/**
 * check any values filled with userGroupsToAdd
 */
function isUserGroupsToAddPopulated() {
	return store.invitationPayload.userGroupsToAdd[0]
		? Object.values(store.invitationPayload.userGroupsToAdd[0]).some(
				(value) => value !== null,
			)
		: false;
}

/**
 * add user groups to the invitation payload
 */
function addUserGroup() {
	const userGroupsUpdate = [...store.invitationPayload.userGroupsToAdd];
	userGroupsUpdate.push({
		userGroupId: null,
		dateStart: null,
		masthead: null,
	});
	store.updatePayload('userGroupsToAdd', userGroupsUpdate, false);
}

const {openDialog} = useModal();
/**
 * remove user groups form user
 * @param userGroup Object
 * @param index Number
 */
function removeUserGroup(userGroup, index) {
	if (numberOfActiveRoles.value <= 1) {
		// user must have atleast one role
		openDialog({
			name: 'oneRoleRemain',
			title: t('invitation.role.removeRole.button'),
			message: t('user.removeRole.roleRemainMessage'),
			actions: [
				{
					label: t('common.close'),
					callback: (close) => {
						close();
					},
				},
			],
			modalStyle: 'negative',
		});
	} else {
		openDialog({
			name: 'removeRole',
			title: t('invitation.role.removeRole.button'),
			message: t('user.removeRole.message'),
			actions: [
				{
					label: t('common.yes'),
					isWarnable: true,
					callback: (close) => {
						store.invitationPayload.currentUserGroups.find(
							(data, i) => i === index,
						).dateEnd = new Date();
						removeRole(store.invitationPayload.userId, userGroup.id);
						close();
					},
				},
				{
					label: t('common.no'),
					callback: (close) => {
						close();
					},
				},
			],
			modalStyle: 'negative',
		});
	}
}

/**
 * remove invted user groups form user
 * @param index Number
 */
function removeInvitedUserGroup(index) {
	const userGroupsUpdate = [...store.invitationPayload.userGroupsToAdd];
	if (isUserGroupsToAddPopulated && userGroupsUpdate.length === 1) {
		userGroupsUpdate.push({
			userGroupId: null,
			dateStart: null,
			masthead: null,
		});
	}
	userGroupsUpdate.splice(index, 1);
	store.updatePayload('userGroupsToAdd', userGroupsUpdate, false);
	updateWithSelectedUserGroups(roleOptions);
}

const userGroupErrors = computed(() => {
	return store.errors || [];
});

/**
 * disabling selecting user groups that already selected
 */
function updateWithSelectedUserGroups(roleOptions) {
	roleOptions.value.filter((element) => {
		if (
			store.invitationPayload.userGroupsToAdd.find(
				(data) => data.userGroupId === element.value,
			)
		) {
			element.disabled = true;
		} else {
			element.disabled = false;
		}
	});
}

/**
 * count number of active roles
 */
const numberOfActiveRoles = computed(() => {
	return store.invitationPayload.currentUserGroups.filter(
		(userGroup) => userGroup.dateEnd === null,
	).length;
});

/**
 * remove user roles
 * @param userId Number
 * @param roleId Number
 */
async function removeRole(userId, roleId) {
	const {apiUrl} = useUrl(`users/${userId}/endRole/${roleId}`);
	const {fetch} = useFetch(apiUrl, {
		method: 'PUT',
	});
	await fetch();
}
</script>

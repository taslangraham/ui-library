<template>
	<fieldset class="pkpFormGroup -pkpClearfix" :class="spacingStyle">
		<div v-if="label || groupComponent" class="pkpFormGroup__heading">
			<template v-if="groupComponent">
				<component
					:is="groupComponent.component"
					v-bind="groupComponent.props"
				></component>
			</template>
			<FormGroupHeader v-else :label="label" :description="description" />
		</div>
		<div class="pkpFormGroup__fields">
			<template v-for="field in fieldsInGroup">
				<template v-if="field.isMultilingual">
					<div :key="field.name" class="pkpFormGroup__localeGroup -pkpClearfix">
						<div
							v-for="locale in availableLocales"
							:key="locale.key"
							class="pkpFormGroup__locale"
							:class="{
								'pkpFormGroup__locale--isVisible': visibleLocales.includes(
									locale.key,
								),
							}"
						>
							<component
								:is="field.component"
								v-bind="field"
								:all-errors="errors"
								:locale-key="locale.key"
								:form-id="formId"
								:primary-locale="primaryLocale"
								:locales="availableLocales"
								@change="fieldChanged"
								@set-errors="setFieldErrors"
							></component>
						</div>
					</div>
				</template>
				<template v-else>
					<component
						:is="field.component"
						v-bind="field"
						:key="field.name"
						:all-errors="errors"
						:form-id="formId"
						:primary-locale="primaryLocale"
						:locales="availableLocales"
						@change="fieldChanged"
						@set-errors="setFieldErrors"
					></component>
				</template>
			</template>
		</div>
	</fieldset>
</template>

<script>
import FormGroupHeader from './FormGroupHeader.vue';
import FieldAffiliations from './fields/FieldAffiliations.vue';
import FieldArchivingPn from './fields/FieldArchivingPn.vue';
import FieldAutosuggestPreset from './fields/FieldAutosuggestPreset.vue';
import FieldBaseAutosuggest from './fields/FieldBaseAutosuggest.vue';
import FieldAuthors from './fields/FieldAuthors.vue';
import FieldColor from './fields/FieldColor.vue';
import FieldControlledVocab from './fields/FieldControlledVocab.vue';
import FieldCreditRoles from './fields/FieldCreditRoles.vue';
import FieldPubId from './fields/FieldPubId.vue';
import FieldHtml from './fields/FieldHtml.vue';
import FieldMetadataSetting from './fields/FieldMetadataSetting.vue';
import FieldOptions from './fields/FieldOptions.vue';
import FieldOrcid from './fields/FieldOrcid.vue';
import FieldPreparedContent from './fields/FieldPreparedContent.vue';
import FieldRadioInput from './fields/FieldRadioInput.vue';
import FieldRichTextarea from './fields/FieldRichTextarea.vue';
import FieldRichText from './fields/FieldRichText.vue';
import FieldSelect from './fields/FieldSelect.vue';
import FieldSelectIssue from './fields/FieldSelectIssue.vue';
import FieldSelectIssues from './fields/FieldSelectIssues.vue';
import FieldSelectSubmissions from './fields/FieldSelectSubmissions.vue';
import FieldSelectUsers from './fields/FieldSelectUsers.vue';
import FieldShowEnsuringLink from './fields/FieldShowEnsuringLink.vue';
import FieldText from './fields/FieldText.vue';
import FieldTextarea from './fields/FieldTextarea.vue';
import FieldUpload from './fields/FieldUpload.vue';
import FieldSlider from './fields/FieldSlider.vue';
import FieldUploadImage from './fields/FieldUploadImage.vue';

import {shouldShowFieldWithinGroup} from './formHelpers';

export default {
	name: 'FormGroup',
	components: {
		FormGroupHeader,
		FieldAffiliations,
		FieldArchivingPn,
		FieldAutosuggestPreset,
		FieldBaseAutosuggest,
		FieldAuthors,
		FieldColor,
		FieldControlledVocab,
		FieldCreditRoles,
		FieldPubId,
		FieldHtml,
		FieldMetadataSetting,
		FieldOptions,
		FieldOrcid,
		FieldPreparedContent,
		FieldRadioInput,
		FieldRichTextarea,
		FieldRichText,
		FieldSelect,
		FieldSelectIssue,
		FieldSelectIssues,
		FieldSelectSubmissions,
		FieldSelectUsers,
		FieldShowEnsuringLink,
		FieldText,
		FieldTextarea,
		FieldSlider,
		FieldUpload,
		FieldUploadImage,
	},
	props: {
		id: String,
		label: String,
		description: String,
		pageId: String,
		groupComponent: Object,
		fields: Array,
		errors: Object,
		formId: String,
		primaryLocale: String,
		visibleLocales: Array,
		availableLocales: Array,
		showWhen: [String, Array],
		spacingVariant: {
			required: false,
			type: String,
			default: () => 'default',
			validator: (val) => ['default', 'fullWidth'].includes(val),
		},
	},
	computed: {
		/**
		 * All fields assigned to this group
		 *
		 * @return {Array}
		 */
		fieldsInGroup() {
			return this.fields.filter(
				(field) =>
					field.groupId === this.id &&
					shouldShowFieldWithinGroup(field, this.fields),
			);
		},

		hasErrors() {
			for (var fieldName in this.fieldsInGroup) {
				if (fieldName in this.errors) {
					return true;
				}
			}
			return false;
		},

		spacingStyle() {
			if (this.spacingVariant === 'fullWidth') {
				return '!p-0';
			}
			return '';
		},
	},
	methods: {
		/**
		 * Emit an event when a field's prop has changed
		 *
		 * @param {String} name Name of the field to modify
		 * @param {String} prop Name of the prop to modify
		 * @param {mixed} value The new value for the prop
		 * @param {String} localeKey Optional locale key for multilingual props
		 */
		fieldChanged: function (name, prop, value, localeKey) {
			this.$emit('change', name, prop, value, localeKey);
		},

		/**
		 * Respond to a field changing its errors
		 *
		 * @param {String} name Field name
		 * @param {Array} errors List of errors for the field
		 * @param {String} localeKey The locale key for a multilingual field
		 */
		setFieldErrors: function (name, errors, localeKey = '') {
			/**
			 * Better practice is to make to copy of data, modify it and send it upstream
			 * But there is challenge with #9996, where each unmounted fields needs to clean up
			 * its error. And given its happening synchronously, it does not propagate updated errors
			 * object in between the unmounts. Therefore last operation would override the previous ones.
			 *
			 * Changing error object inplace ensures all the updates gets registered.
			 *
			 * In future better approach would be to have remove-error event, which defines what to remove
			 * and would be correctly processed by the state manager
			 */

			let newErrors = this.errors;
			if (!errors || !errors.length) {
				if (localeKey && newErrors[name] && newErrors[name][localeKey]) {
					delete newErrors[name][localeKey];
				} else if (newErrors[name]) {
					delete newErrors[name];
				}
			} else {
				if (localeKey) {
					newErrors[name] = newErrors[name] || {};
					newErrors[name][localeKey] = errors;
				} else {
					newErrors[name] = errors;
				}
			}
			this.$emit('set-errors', {...newErrors});
		},
	},
};
</script>

<style lang="less">
@import '../../styles/_import';

.pkpFormGroup {
	position: relative;
	margin: 0;
	padding: 2rem;
	border: none;

	+ .pkpFormGroup {
		border-top: @bg-border-light;
	}
}

.pkpFormGroup__heading {
	float: left;
	width: 30%;
	padding-inline-end: 1.5rem;
	line-height: @line-sml;

	+ .pkpFormGroup__fields {
		float: right;
		width: 70%;
		padding-inline-start: 1.5rem;
	}
}

[dir='rtl'] {
	.pkpFormGroup__heading {
		float: right;

		.pkpFormGroup__fields {
			float: left;
		}
	}
}

.pkpFormGroup__legend {
	display: inline-block;
	margin-bottom: 0.5rem;
	font-weight: @bold;
	font-size: @font-base-larger;
}

.pkpFormGroup__description {
	font-size: @font-sml;
}

.pkpFormGroup .pkpFormField + .pkpFormField,
.pkpFormGroup .pkpFormField + .pkpFormGroup__localeGroup,
.pkpFormGroup .pkpFormGroup__localeGroup + .pkpFormField,
.pkpFormGroup .pkpFormGroup__localeGroup + .pkpFormGroup__localeGroup {
	margin-top: 1.5rem;
}

.pkpFormGroup__locale {
	display: none;
}

.pkpFormGroup__locale--isVisible {
	display: block;
}

// When multiple locales are being displayed at once
.pkpForm--hasManyVisibleLocales {
	.pkpFormGroup__heading {
		float: none;
		padding-inline-end: 0;
		margin-bottom: 2rem;
		width: 100%;
		max-width: 35em;

		+ .pkpFormGroup__fields {
			float: none;
			width: 100%;
			padding-inline-start: 0;
		}
	}

	.pkpFormGroup__locale--isVisible {
		float: left;
		width: 50%;
		padding-inline-end: 1.5rem;

		~ .pkpFormGroup__locale--isVisible {
			padding-inline-end: 0;
			padding-inline-start: 1.5rem;
		}
	}
}
[dir='rtl'] {
	.pkpForm--hasManyVisibleLocales {
		.pkpFormGroup__locale--isVisible {
			float: right;
		}
	}
}

// When forms appear in a dropdown
.pkpDropdown .pkpFormGroup {
	padding: 0.5rem;
}
</style>

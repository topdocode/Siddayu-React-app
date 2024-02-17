import Delete from "../../Delete";
import Patch from "../../Patch";
import Post from "../../Post";
import Put from "../../Put";

const { default: Get } = require("../../Get");

const projectAtrributes = (token, id, navigation) => Get(`/project-management/projects/?client=${id}`, false, token, navigation);
const clients = (token, navigation) => Get('/clients', false, token, navigation);
const crmProject = (token, clientId = '', navigation, page = 0) => Get(`/project-management/crm_projects/?${clientId != '' ? `profile__client=${clientId}&ordering=id&` : null}on_mobile_list=true${page != 0 ? `&page=${page}` : null}`, false, token, navigation)
const crmProjectAll = (token, clientId = '', filter = '', navigation, page = 0) => Get(`/project-management/crm_projects/?${clientId != '' ? `profile__client=${clientId}&ordering=-id&` : null}max_size=true${filter}`, false, token, navigation)
const crmProjectDetail = (token, idCrm, navigation) => Get(`/project-management/crm_projects/${idCrm}`, false, token, navigation)
const businessUnit = (token, clientId, navigation) => Get(`/accounting/business_units/list_names/?client=${clientId}&max_size=true`, false, token, navigation)
const projectProfile = (token, clientId, navigation, maxSize = true) => Get(`/project-management/project_profiles/?client=${clientId}&max_size=${maxSize}`, false, token, navigation)
const memberCrm = (token, clientId, navigation) => Get(`/crm/members/?client=${clientId}&max_size=true`, false, token, navigation)
const contactCrm = (token, clientId, navigation, memberIsnull = true) => Get(`/crm/contacts/?client=${clientId}&member__isnull=${memberIsnull}&max_size=true`, false, token, navigation)
const contactCrmDetail = (token, id, navigation) => Get(`/crm/contacts/${id}`, false, token, navigation)
const profileAttribute = (token, profileId, navigation) => Get(`/project-management/profile_attributes/?profile=${profileId}&max_size=true`, false, token, navigation)
const updateCrmProject = (token, data, idCrm, navigation) => Patch(`/project-management/crm_projects/${idCrm}/`, false, data, token, 'application/json', navigation)
const locationCrmProject = (token, clientId, navigation) => Get(`/locations?client=${clientId}&max_size=true`, false, token, navigation)
const getCountry = (token, navigation) => Get('/countries?max_size=true', false, token, navigation)
const addLocation = (token, data, navigation) => Post('/locations/', false, data, token, 'application/json', navigation)
const addComment = (token, data, navigation) => Post('/project-management/project_comments/', false, data, token, 'application/json', navigation)
const attributeFilter = (token, id, navigation) => Get(`/project-management/attribute_filters/?attribute__client=${id}&type=Filter&max_size=true`, false, token, navigation)
const deleteProject = (token, projectId, navigation) => Delete(`/project-management/crm_projects/${projectId}/`, false, token, navigation)
const getCount = (token, clientId, navigation,) => Get(`/crm/members/get_counts/?client=${clientId}`, false, token, navigation)
const getHistories = (token, clientId, navigation,) => Get(`/crm/histories/?member__client=${clientId}&ordering=-timestamp&max_size=true`, false, token, navigation)
const addContact = (token, data, navigation) => Post('/crm/contacts/', false, data, token, 'application/json', navigation)
const updateContact = (token, data, id, navigation) => Patch(`/crm/contacts/${id}/`, false, data, token, 'application/json', navigation)
const getMemberDetail = (token, memberId, navigation) => Get(`/crm/members/${memberId}/`, false, token, navigation)
const getCrmAttribute = (token, clientId, navigation) => Get(`/crm/attributes/?category__client=${clientId}`, false, token, navigation)
const getCrmAttributeOption = (token, attributeId, navigation) => Get(`/crm/attribute_options/?attribute=${attributeId}`, false, token, navigation)
const getCountCrm = (token, clientId, navigation) => Get(`/locations/get_crm_counts/?client=${clientId}`, false, token, navigation)
const getLocationContact = (token, clientId, navigation) => Get(`/locations/get_contact_locations/?client=${clientId}`, false, token, navigation)
const getLocationCustomer = (token, clientId, navigation) => Get(`/locations/get_member_locations/?client=${clientId}`, false, token, navigation)
const getLocations = (token, clientId, navigation) => Get(`/locations/?client=${clientId}&max_size=true`, false, token, navigation)
const deleteCustomerCrm = (token, data, navigation) => Delete(`/crm/members/bulk_delete/`, false, token, navigation, data, 'multipart/form-data')
const locationBulkUpdate = (token, data, navigation) => Patch('/locations/bulk_update/', false, data, token, 'application/json', navigation,)

// updatte
const crmMemberUpdate = (token, data, id, navigation) => Put(`/crm/members/${id}/`, false, data, token, 'multipart/form-data', navigation)

const ProjectCrmService = {
    clients,
    projectAtrributes,
    crmProject,
    crmProjectDetail,
    businessUnit,
    memberCrm,
    profileAttribute,
    updateCrmProject,
    locationCrmProject,
    getCountry,
    addLocation,
    addComment,
    crmProjectAll,
    attributeFilter,
    contactCrm,
    deleteProject,
    projectProfile,
    getCount,
    getHistories,
    addContact,
    getMemberDetail,
    getCrmAttribute,
    getCrmAttributeOption,
    getCountCrm,
    getLocationContact,
    getLocationCustomer,
    deleteCustomerCrm,
    locationBulkUpdate,
    getLocations,
    crmMemberUpdate,
    contactCrmDetail,
    updateContact
}

export default ProjectCrmService;
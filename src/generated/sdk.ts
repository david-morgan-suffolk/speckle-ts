import type { GraphQLClient, RequestOptions } from 'graphql-request';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: string; output: string; }
  DateTime: { input: string; output: string; }
  JSON: { input: any; output: any; }
  JSONObject: { input: Record<string, unknown>; output: Record<string, unknown>; }
};

export type AccFolder = {
  __typename?: 'AccFolder';
  children: AccFolderCollection;
  contents: AccItemCollection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type AccFolderCollection = {
  __typename?: 'AccFolderCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<AccFolder>;
};

export type AccHub = {
  __typename?: 'AccHub';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  project: AccProject;
  projects: AccProjectCollection;
};


export type AccHubprojectArgs = {
  id: Scalars['ID']['input'];
};

export type AccHubCollection = {
  __typename?: 'AccHubCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<AccHub>;
};

export type AccIntegration = {
  __typename?: 'AccIntegration';
  folder: AccFolder;
  hub: AccHub;
  hubs: AccHubCollection;
  item: AccItem;
  project: AccProject;
};


export type AccIntegrationfolderArgs = {
  folderId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type AccIntegrationhubArgs = {
  id: Scalars['String']['input'];
};


export type AccIntegrationitemArgs = {
  itemId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type AccIntegrationprojectArgs = {
  hubId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};

export type AccItem = {
  __typename?: 'AccItem';
  /** lineage urn */
  id: Scalars['ID']['output'];
  latestVersion: AccItemVersion;
  name: Scalars['String']['output'];
  /**
   * Size of the latest version in bytes, when reported by ACC. Sourced from the
   * tip version sideloaded in the folder-contents response — one API call.
   */
  sizeBytes: Maybe<Scalars['Int']['output']>;
};

export type AccItemCollection = {
  __typename?: 'AccItemCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<AccItem>;
};

export type AccItemVersion = {
  __typename?: 'AccItemVersion';
  fileType: Maybe<Scalars['String']['output']>;
  /** version urn */
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  versionNumber: Scalars['Int']['output'];
};

export type AccProject = {
  __typename?: 'AccProject';
  folder: AccFolder;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rootFolder: AccFolder;
};


export type AccProjectfolderArgs = {
  id: Scalars['String']['input'];
};

export type AccProjectCollection = {
  __typename?: 'AccProjectCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<AccProject>;
};

/**
 * Deprecated: use the generic `Sync` type instead. Retained to avoid
 * breaking existing clients (CLI, connectors, older frontend builds).
 */
export type AccSyncItem = {
  __typename?: 'AccSyncItem';
  accFileExtension: Scalars['String']['output'];
  accFileLineageUrn: Scalars['String']['output'];
  accFileName: Scalars['String']['output'];
  accFileVersionIndex: Scalars['Int']['output'];
  accFileVersionUrn: Scalars['String']['output'];
  accFileViewName: Maybe<Scalars['String']['output']>;
  accFolderPath: Array<Scalars['String']['output']>;
  accHubId: Scalars['String']['output'];
  accProjectId: Scalars['String']['output'];
  accRegion: Scalars['String']['output'];
  accRootProjectFolderUrn: Scalars['String']['output'];
  accWebhookId: Maybe<Scalars['String']['output']>;
  author: Maybe<LimitedUser>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  model: Maybe<Model>;
  project: Project;
  status: AccSyncItemStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type AccSyncItemCollection = {
  __typename?: 'AccSyncItemCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<AccSyncItem>;
  totalCount: Scalars['Int']['output'];
};

export type AccSyncItemMutations = {
  __typename?: 'AccSyncItemMutations';
  /** @deprecated Use syncMutations.create instead, we will be removing this in the 6 months. */
  create: AccSyncItem;
  /** @deprecated Use syncMutations.delete instead, we will be removing this in the 6 months. */
  delete: Scalars['Boolean']['output'];
  /** @deprecated Use syncMutations.update instead, we will be removing this in the 6 months. */
  update: AccSyncItem;
};


export type AccSyncItemMutationscreateArgs = {
  input: CreateAccSyncItemInput;
};


export type AccSyncItemMutationsdeleteArgs = {
  input: DeleteAccSyncItemInput;
};


export type AccSyncItemMutationsupdateArgs = {
  input: UpdateAccSyncItemInput;
};

export enum AccSyncItemStatus {
  failed = 'failed',
  paused = 'paused',
  pending = 'pending',
  succeeded = 'succeeded',
  syncing = 'syncing'
}

export type ActiveUserMutations = {
  __typename?: 'ActiveUserMutations';
  emailMutations: UserEmailMutations;
  /** Mark onboarding as complete */
  finishOnboarding: Scalars['Boolean']['output'];
  meta: UserMetaMutations;
  /** Either workspace slug or id is accepted. If neither are provided, the active workspace will be unset. */
  setActiveWorkspace: Maybe<LimitedWorkspace>;
  /** Edit a user's profile */
  update: User;
};


export type ActiveUserMutationsfinishOnboardingArgs = {
  input?: InputMaybe<OnboardingCompletionInput>;
};


export type ActiveUserMutationssetActiveWorkspaceArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type ActiveUserMutationsupdateArgs = {
  user: UserUpdateInput;
};

export type Activity = {
  __typename?: 'Activity';
  actionType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  info: Scalars['JSONObject']['output'];
  message: Scalars['String']['output'];
  resourceId: Scalars['String']['output'];
  resourceType: Scalars['String']['output'];
  streamId: Maybe<Scalars['String']['output']>;
  time: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type ActivityCollection = {
  __typename?: 'ActivityCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Activity>;
  totalCount: Scalars['Int']['output'];
};

export type AddDomainToWorkspaceInput = {
  domain: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type AddWorkspaceDomainInput = {
  domain: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type AdditionalRequestHeader = {
  __typename?: 'AdditionalRequestHeader';
  header: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type AdminExternalSyncMutations = {
  __typename?: 'AdminExternalSyncMutations';
  /** Sync versions from external Speckle servers into local projects */
  syncVersion: AdminExternalSyncVersionResponse;
};


export type AdminExternalSyncMutationssyncVersionArgs = {
  input: AdminExternalSyncVersionInput;
};

export type AdminExternalSyncVersionInput = {
  /** Optionally specify the model of the local project to sync data into */
  modelId?: InputMaybe<Scalars['ID']['input']>;
  /** ID of the local project to sync the version into */
  projectId: Scalars['ID']['input'];
  /** Only needed if data is behind authentication */
  token?: InputMaybe<Scalars['String']['input']>;
  /** The full URL of the version you want to sync from an external Speckle server */
  versionUrl: Scalars['String']['input'];
};

export type AdminExternalSyncVersionResponse = {
  __typename?: 'AdminExternalSyncVersionResponse';
  /** Sync is currently async, so use this to find logs in your observability stack */
  correlationId: Scalars['String']['output'];
};

export type AdminInviteList = {
  __typename?: 'AdminInviteList';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<ServerInvite>;
  totalCount: Scalars['Int']['output'];
};

export type AdminLinkWorkspaceSubscriptionInput = {
  billingInterval: BillingInterval;
  subscriptionId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type AdminMutations = {
  __typename?: 'AdminMutations';
  /**
   * Add a verified domain to a workspace. Admin-only operation that bypasses
   * normal email verification requirements. Blocked domains are still rejected.
   */
  addWorkspaceDomain: WorkspaceDomain;
  grantWorkspaceFeature: Scalars['Boolean']['output'];
  linkWorkspaceSubscription: Scalars['Boolean']['output'];
  /**
   * Remove a domain from a workspace. Admin-only operation that bypasses
   * normal role requirements.
   */
  removeWorkspaceDomain: Scalars['Boolean']['output'];
  requestEmailVerification: SentEmailInfo;
  requestPasswordReset: SentEmailInfo;
  revokeWorkspaceFeature: Scalars['Boolean']['output'];
  sendDeliverabilityTestEmail: SentEmailInfo;
  /**
   * A server administrator can update the verification status of an user's email.
   * The server administrator is recommended to confirm ownership of the email address
   * with the user before performing this action.
   */
  updateEmailVerification: Scalars['Boolean']['output'];
  updateWorkspaceLimits: Scalars['Boolean']['output'];
  updateWorkspacePlan: Scalars['Boolean']['output'];
};


export type AdminMutationsaddWorkspaceDomainArgs = {
  input: AddWorkspaceDomainInput;
};


export type AdminMutationsgrantWorkspaceFeatureArgs = {
  input: WorkspaceFeatureGrantUpdateInput;
};


export type AdminMutationslinkWorkspaceSubscriptionArgs = {
  input: AdminLinkWorkspaceSubscriptionInput;
};


export type AdminMutationsremoveWorkspaceDomainArgs = {
  input: RemoveWorkspaceDomainInput;
};


export type AdminMutationsrequestEmailVerificationArgs = {
  emailId: Scalars['ID']['input'];
};


export type AdminMutationsrequestPasswordResetArgs = {
  input: AdminRequestPasswordResetInput;
};


export type AdminMutationsrevokeWorkspaceFeatureArgs = {
  input: WorkspaceFeatureGrantUpdateInput;
};


export type AdminMutationssendDeliverabilityTestEmailArgs = {
  emailId: Scalars['ID']['input'];
};


export type AdminMutationsupdateEmailVerificationArgs = {
  input: AdminUpdateEmailVerificationInput;
};


export type AdminMutationsupdateWorkspaceLimitsArgs = {
  input: WorkspaceLimitsUpdateInput;
};


export type AdminMutationsupdateWorkspacePlanArgs = {
  input: AdminUpdateWorkspacePlanInput;
};

export type AdminPasswordResetToken = {
  __typename?: 'AdminPasswordResetToken';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  obfuscatedToken: Scalars['String']['output'];
};

export type AdminQueries = {
  __typename?: 'AdminQueries';
  inviteList: AdminInviteList;
  projectList: ProjectCollection;
  serverStatistics: ServerStatistics;
  user: Maybe<AdminUserListItem>;
  userList: AdminUserList;
  workspaceList: WorkspaceCollection;
};


export type AdminQueriesinviteListArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  query?: InputMaybe<Scalars['String']['input']>;
};


export type AdminQueriesprojectListArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
};


export type AdminQueriesuserArgs = {
  id: Scalars['ID']['input'];
};


export type AdminQueriesuserListArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  query?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<ServerRole>;
};


export type AdminQueriesworkspaceListArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  query?: InputMaybe<Scalars['String']['input']>;
};

export type AdminRequestPasswordResetInput = {
  email: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type AdminUpdateEmailVerificationInput = {
  email: Scalars['String']['input'];
  /** Defaults to true. If set to false, the email will be marked as unverified. */
  verified?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AdminUpdateWorkspacePlanInput = {
  plan: WorkspacePlans;
  status: WorkspacePlanStatuses;
  validUntil?: InputMaybe<Scalars['DateTime']['input']>;
  workspaceId: Scalars['ID']['input'];
};

export type AdminUserList = {
  __typename?: 'AdminUserList';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<AdminUserListItem>;
  totalCount: Scalars['Int']['output'];
};

export type AdminUserListItem = {
  __typename?: 'AdminUserListItem';
  avatar: Maybe<Scalars['String']['output']>;
  company: Maybe<Scalars['String']['output']>;
  email: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  passwordResetTokens: Array<AdminPasswordResetToken>;
  role: Maybe<Scalars['String']['output']>;
  userEmails: Array<UserEmail>;
  verified: Maybe<Scalars['Boolean']['output']>;
};

export type AdminUsersListCollection = {
  __typename?: 'AdminUsersListCollection';
  items: Array<AdminUsersListItem>;
  totalCount: Scalars['Int']['output'];
};

/**
 * A representation of a registered or invited user in the admin users list. Either registeredUser
 * or invitedUser will always be set, both values can't be null.
 */
export type AdminUsersListItem = {
  __typename?: 'AdminUsersListItem';
  id: Scalars['String']['output'];
  invitedUser: Maybe<ServerInvite>;
  registeredUser: Maybe<User>;
};

export type AdminWorkspaceJoinRequestFilter = {
  status?: InputMaybe<WorkspaceJoinRequestStatus>;
};

export type ApiToken = {
  __typename?: 'ApiToken';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  lastChars: Scalars['String']['output'];
  lastUsed: Scalars['DateTime']['output'];
  lifespan: Scalars['BigInt']['output'];
  name: Scalars['String']['output'];
  scopes: Array<Maybe<Scalars['String']['output']>>;
};

export type ApiTokenCreateInput = {
  lifespan?: InputMaybe<Scalars['BigInt']['input']>;
  /** Optionally limit the token to only have access to specific resources */
  limitResources?: InputMaybe<Array<TokenResourceIdentifierInput>>;
  name: Scalars['String']['input'];
  scopes: Array<Scalars['String']['input']>;
};

export type AppAuthor = {
  __typename?: 'AppAuthor';
  avatar: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type AppCreateInput = {
  description: Scalars['String']['input'];
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  public?: InputMaybe<Scalars['Boolean']['input']>;
  redirectUrl: Scalars['String']['input'];
  scopes: Array<InputMaybe<Scalars['String']['input']>>;
  termsAndConditionsLink?: InputMaybe<Scalars['String']['input']>;
};

export type AppTokenCreateInput = {
  lifespan?: InputMaybe<Scalars['BigInt']['input']>;
  /** Optionally limit the token to only have access to specific resources */
  limitResources?: InputMaybe<Array<TokenResourceIdentifierInput>>;
  name: Scalars['String']['input'];
  scopes: Array<Scalars['String']['input']>;
};

export type AppUpdateInput = {
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  public?: InputMaybe<Scalars['Boolean']['input']>;
  redirectUrl: Scalars['String']['input'];
  scopes: Array<InputMaybe<Scalars['String']['input']>>;
  termsAndConditionsLink?: InputMaybe<Scalars['String']['input']>;
};

export type ApproveWorkspaceJoinRequestInput = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type ApproveWorkspaceSupportAccessInput = {
  sessionId: Scalars['ID']['input'];
};

export type ArchiveCommentInput = {
  archived: Scalars['Boolean']['input'];
  commentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};

export type AssignedLabel = {
  __typename?: 'AssignedLabel';
  hexColor: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type AuthStrategy = {
  __typename?: 'AuthStrategy';
  color: Maybe<Scalars['String']['output']>;
  icon: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type AutomateAuthCodePayloadTest = {
  action: Scalars['String']['input'];
  code: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

/** Additional resources to validate user access to. */
export type AutomateAuthCodeResources = {
  automationId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  workspaceId?: InputMaybe<Scalars['String']['input']>;
};

export type AutomateFunction = {
  __typename?: 'AutomateFunction';
  /** Only returned if user is a part of this speckle server */
  creator: Maybe<LimitedUser>;
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isFeatured: Scalars['Boolean']['output'];
  logo: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  permissions: AutomateFunctionPermissionChecks;
  releases: AutomateFunctionReleaseCollection;
  repo: BasicGitRepositoryMetadata;
  /** SourceAppNames values from @speckle/shared. Empty array means - all of them */
  supportedSourceApps: Array<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  workspaceIds: Array<Scalars['String']['output']>;
};


export type AutomateFunctionreleasesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AutomateFunctionReleasesFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type AutomateFunctionCollection = {
  __typename?: 'AutomateFunctionCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<AutomateFunction>;
  totalCount: Scalars['Int']['output'];
};

export type AutomateFunctionPermissionChecks = {
  __typename?: 'AutomateFunctionPermissionChecks';
  canRegenerateToken: PermissionCheckResult;
};

export type AutomateFunctionRelease = {
  __typename?: 'AutomateFunctionRelease';
  commitId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  function: AutomateFunction;
  functionId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  inputSchema: Maybe<Scalars['JSONObject']['output']>;
  versionTag: Scalars['String']['output'];
};

export type AutomateFunctionReleaseCollection = {
  __typename?: 'AutomateFunctionReleaseCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<AutomateFunctionRelease>;
  totalCount: Scalars['Int']['output'];
};

export type AutomateFunctionReleasesFilter = {
  search?: InputMaybe<Scalars['String']['input']>;
};

export type AutomateFunctionRun = {
  __typename?: 'AutomateFunctionRun';
  contextView: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  elapsed: Scalars['Float']['output'];
  /** Nullable, in case the function is not retrievable due to poor network conditions */
  function: Maybe<AutomateFunction>;
  functionId: Maybe<Scalars['String']['output']>;
  functionReleaseId: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** AutomateTypes.ResultsSchema type from @speckle/shared */
  results: Maybe<Scalars['JSONObject']['output']>;
  status: AutomateRunStatus;
  statusMessage: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type AutomateFunctionRunStatusReportInput = {
  contextView?: InputMaybe<Scalars['String']['input']>;
  functionRunId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  /**
   * Signal to the server, that the status report is coming from the function,
   * and not from the execution engine.
   */
  reportingFromFunction?: Scalars['Boolean']['input'];
  /** AutomateTypes.ResultsSchema type from @speckle/shared */
  results?: InputMaybe<Scalars['JSONObject']['input']>;
  status: AutomateRunStatus;
  statusMessage?: InputMaybe<Scalars['String']['input']>;
};

export type AutomateFunctionTemplate = {
  __typename?: 'AutomateFunctionTemplate';
  id: AutomateFunctionTemplateLanguage;
  logo: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export enum AutomateFunctionTemplateLanguage {
  DOT_NET = 'DOT_NET',
  PYTHON = 'PYTHON',
  TYPESCRIPT = 'TYPESCRIPT'
}

export type AutomateFunctionToken = {
  __typename?: 'AutomateFunctionToken';
  functionId: Scalars['String']['output'];
  functionToken: Scalars['String']['output'];
};

export type AutomateFunctionsFilter = {
  /** By default, we include featured ("public") functions. Set this to false to exclude them. */
  includeFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  /** By default, we exclude functions without releases. Set this to false to include them. */
  requireRelease?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type AutomateMutations = {
  __typename?: 'AutomateMutations';
  createFunction: AutomateFunction;
  createFunctionWithoutVersion: AutomateFunctionToken;
  regenerateFunctionToken: Scalars['String']['output'];
  updateFunction: AutomateFunction;
};


export type AutomateMutationscreateFunctionArgs = {
  input: CreateAutomateFunctionInput;
};


export type AutomateMutationscreateFunctionWithoutVersionArgs = {
  input: CreateAutomateFunctionWithoutVersionInput;
};


export type AutomateMutationsregenerateFunctionTokenArgs = {
  functionId: Scalars['String']['input'];
};


export type AutomateMutationsupdateFunctionArgs = {
  input: UpdateAutomateFunctionInput;
};

export type AutomateRun = {
  __typename?: 'AutomateRun';
  automation: Automation;
  automationId: Scalars['String']['output'];
  automationRevisionId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  functionRuns: Array<AutomateFunctionRun>;
  id: Scalars['ID']['output'];
  status: AutomateRunStatus;
  trigger: AutomationRunTrigger;
  updatedAt: Scalars['DateTime']['output'];
};

export type AutomateRunCollection = {
  __typename?: 'AutomateRunCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<AutomateRun>;
  totalCount: Scalars['Int']['output'];
};

export enum AutomateRunStatus {
  CANCELED = 'CANCELED',
  EXCEPTION = 'EXCEPTION',
  FAILED = 'FAILED',
  INITIALIZING = 'INITIALIZING',
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  TIMEOUT = 'TIMEOUT'
}

export enum AutomateRunTriggerType {
  VERSION_CREATED = 'VERSION_CREATED'
}

export type Automation = {
  __typename?: 'Automation';
  createdAt: Scalars['DateTime']['output'];
  /** Only accessible to automation owners */
  creationPublicKeys: Array<Scalars['String']['output']>;
  currentRevision: Maybe<AutomationRevision>;
  enabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isTestAutomation: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  permissions: AutomationPermissionChecks;
  runs: AutomateRunCollection;
  updatedAt: Scalars['DateTime']['output'];
};


export type AutomationrunsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type AutomationCollection = {
  __typename?: 'AutomationCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Automation>;
  totalCount: Scalars['Int']['output'];
};

export type AutomationPermissionChecks = {
  __typename?: 'AutomationPermissionChecks';
  canDelete: PermissionCheckResult;
  canRead: PermissionCheckResult;
  canUpdate: PermissionCheckResult;
};

export type AutomationRevision = {
  __typename?: 'AutomationRevision';
  functions: Array<AutomationRevisionFunction>;
  id: Scalars['ID']['output'];
  triggerDefinitions: Array<AutomationRevisionTriggerDefinition>;
};

export type AutomationRevisionCreateFunctionInput = {
  functionId: Scalars['String']['input'];
  functionReleaseId: Scalars['String']['input'];
  /**
   * If encrypted from the client side, its an opaque string, else its a JSON string.
   * If the function has no input, leave it empty.
   */
  parameters?: InputMaybe<Scalars['String']['input']>;
  paramsEncrypted?: Scalars['Boolean']['input'];
};

export type AutomationRevisionFunction = {
  __typename?: 'AutomationRevisionFunction';
  /** The secrets in parameters are redacted with six asterisks - ****** */
  parameters: Maybe<Scalars['JSONObject']['output']>;
  release: AutomateFunctionRelease;
};

export type AutomationRevisionTriggerDefinition = VersionCreatedTriggerDefinition;

export type AutomationRunTrigger = VersionCreatedTrigger;

export type BasicGitRepositoryMetadata = {
  __typename?: 'BasicGitRepositoryMetadata';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  owner: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type BeforeChangeSavedView = {
  __typename?: 'BeforeChangeSavedView';
  groupId: Maybe<Scalars['ID']['output']>;
  groupResourceIds: Array<Scalars['String']['output']>;
  position: Scalars['Float']['output'];
  resourceIds: Array<Scalars['String']['output']>;
};

export type BillingAddress = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  line1?: InputMaybe<Scalars['String']['input']>;
  line2?: InputMaybe<Scalars['String']['input']>;
  postal_code?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
};

export type BillingDetails = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export enum BillingInterval {
  monthly = 'monthly',
  yearly = 'yearly'
}

export type BlobMetadata = {
  __typename?: 'BlobMetadata';
  createdAt: Scalars['DateTime']['output'];
  fileHash: Maybe<Scalars['String']['output']>;
  fileName: Scalars['String']['output'];
  fileSize: Maybe<Scalars['Int']['output']>;
  fileType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  resourceId: Scalars['String']['output'];
  resourceType: BlobResourceType;
  /** @deprecated Use `resourceId` with `resourceType`. For backwards compatibility, this field always returns the same value as `resourceId`, even if `resourceType` is not `project`. */
  streamId: Scalars['String']['output'];
  uploadError: Maybe<Scalars['String']['output']>;
  uploadStatus: Scalars['Int']['output'];
  userId: Maybe<Scalars['String']['output']>;
};

export type BlobMetadataCollection = {
  __typename?: 'BlobMetadataCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Maybe<Array<BlobMetadata>>;
  totalCount: Scalars['Int']['output'];
  totalSize: Scalars['Int']['output'];
};

export enum BlobResourceType {
  project = 'project',
  workspace = 'workspace'
}

export type Branch = {
  __typename?: 'Branch';
  /**
   * All the recent activity on this branch in chronological order
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  activity: Maybe<ActivityCollection>;
  author: Maybe<User>;
  commits: Maybe<CommitCollection>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};


export type BranchactivityArgs = {
  actionType?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['DateTime']['input']>;
  before?: InputMaybe<Scalars['DateTime']['input']>;
  cursor?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
};


export type BranchcommitsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};

export type BranchCollection = {
  __typename?: 'BranchCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Maybe<Array<Branch>>;
  totalCount: Scalars['Int']['output'];
};

export type BranchCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  streamId: Scalars['String']['input'];
};

export type BranchDeleteInput = {
  id: Scalars['String']['input'];
  streamId: Scalars['String']['input'];
};

export type BranchUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  streamId: Scalars['String']['input'];
};

export type BulkUsersRetrievalInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  emails: Array<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type CanUpgradePlanInput = {
  targetInterval: BillingInterval;
  targetPlan: WorkspacePlans;
};

export type Comment = {
  __typename?: 'Comment';
  archived: Scalars['Boolean']['output'];
  author: Maybe<LimitedUser>;
  authorId: Maybe<Scalars['String']['output']>;
  /** Similar to resourceIds, except w/ version info stripped. Only set on threads! */
  baseResourceIds: Array<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  /**
   * Legacy comment viewer data field
   * @deprecated Use the new viewerState field instead. Returns empty object.
   */
  data: Maybe<Scalars['JSONObject']['output']>;
  /** Whether or not comment is a reply to another comment */
  hasParent: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  /** Parent thread, if there's any */
  parent: Maybe<Comment>;
  permissions: CommentPermissionChecks;
  /** Plain-text version of the comment text, ideal for previews */
  rawText: Maybe<Scalars['String']['output']>;
  /** @deprecated Not actually implemented */
  reactions: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Gets the replies to this comment. */
  replies: CommentCollection;
  /** Get authors of replies to this comment */
  replyAuthors: CommentReplyAuthorCollection;
  /** Resources that this comment refers to. Only set on threads! */
  resourceIds: Array<Scalars['String']['output']>;
  /**
   * Resources that this comment targets. Can be a mixture of either one stream, or multiple commits and objects.
   * @deprecated Legacy API surface, to be removed in the future. Use resourceIds/baseResourceIds instead.
   */
  resources: Array<ResourceIdentifier>;
  screenshot: Maybe<Scalars['String']['output']>;
  text: Maybe<SmartTextEditorValue>;
  /** The time this comment was last updated. Corresponds also to the latest reply to this comment, if any. */
  updatedAt: Scalars['DateTime']['output'];
  /** The last time you viewed this comment. Present only if an auth'ed request. Relevant only if a top level commit. */
  viewedAt: Maybe<Scalars['DateTime']['output']>;
  /** Resource identifiers as defined and implemented in the Viewer of the new frontend */
  viewerResources: Array<ViewerResourceItem>;
  /** SerializedViewerState */
  viewerState: Maybe<Scalars['JSONObject']['output']>;
};


export type CommentrepliesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type CommentreplyAuthorsArgs = {
  limit?: Scalars['Int']['input'];
};

export type CommentCollection = {
  __typename?: 'CommentCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Comment>;
  totalCount: Scalars['Int']['output'];
};

export type CommentContentInput = {
  blobIds?: InputMaybe<Array<Scalars['String']['input']>>;
  doc?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type CommentDataFilters = {
  __typename?: 'CommentDataFilters';
  hiddenIds: Maybe<Array<Scalars['String']['output']>>;
  isolatedIds: Maybe<Array<Scalars['String']['output']>>;
  passMax: Maybe<Scalars['Float']['output']>;
  passMin: Maybe<Scalars['Float']['output']>;
  propertyInfoKey: Maybe<Scalars['String']['output']>;
  sectionBox: Maybe<Scalars['JSONObject']['output']>;
};

export type CommentMutations = {
  __typename?: 'CommentMutations';
  /** @deprecated Comments were moved to issues. Use ProjectIssueMutations instead. This mutation will be removed after 01 Jun 2026. */
  archive: Scalars['Boolean']['output'];
  /** @deprecated Comments were moved to issues. Use ProjectIssueMutations instead. This mutation will be removed after 01 Jun 2026. */
  create: Comment;
  /** @deprecated Comments were moved to issues. Use ProjectIssueMutations instead. This mutation will be removed after 01 Jun 2026. */
  edit: Comment;
  /** @deprecated Comments were moved to issues. Use ProjectIssueMutations instead. This mutation will be removed after 01 Jun 2026. */
  markViewed: Scalars['Boolean']['output'];
  /** @deprecated Comments were moved to issues. Use ProjectIssueMutations instead. This mutation will be removed after 01 Jun 2026. */
  reply: Comment;
};


export type CommentMutationsarchiveArgs = {
  input: ArchiveCommentInput;
};


export type CommentMutationscreateArgs = {
  input: CreateCommentInput;
};


export type CommentMutationseditArgs = {
  input: EditCommentInput;
};


export type CommentMutationsmarkViewedArgs = {
  input: MarkCommentViewedInput;
};


export type CommentMutationsreplyArgs = {
  input: CreateCommentReplyInput;
};

export type CommentPermissionChecks = {
  __typename?: 'CommentPermissionChecks';
  canArchive: PermissionCheckResult;
};

export type CommentReplyAuthorCollection = {
  __typename?: 'CommentReplyAuthorCollection';
  items: Array<LimitedUser>;
  totalCount: Scalars['Int']['output'];
};

export type Commit = {
  __typename?: 'Commit';
  /**
   * All the recent activity on this commit in chronological order
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  activity: Maybe<ActivityCollection>;
  authorAvatar: Maybe<Scalars['String']['output']>;
  authorId: Maybe<Scalars['String']['output']>;
  authorName: Maybe<Scalars['String']['output']>;
  branch: Maybe<Branch>;
  branchName: Maybe<Scalars['String']['output']>;
  /**
   * The total number of comments for this commit. To actually get the comments, use the comments query and pass in a resource array consisting of of this commit's id.
   * E.g.,
   * ```
   * query{
   *   comments(streamId:"streamId" resources:[{resourceType: commit, resourceId:"commitId"}] ){
   *     ...
   *   }
   * ```
   * @deprecated Part of the old API surface and will be removed in the future. Always returns 0.
   */
  commentCount: Scalars['Int']['output'];
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  message: Maybe<Scalars['String']['output']>;
  parents: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  referencedObject: Scalars['String']['output'];
  sourceApplication: Maybe<Scalars['String']['output']>;
  /**
   * Will throw an authorization error if active user isn't authorized to see it, for example,
   * if a stream isn't public and the user doesn't have the appropriate rights.
   */
  stream: Stream;
  /** @deprecated Use the stream field instead */
  streamId: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the stream field instead */
  streamName: Maybe<Scalars['String']['output']>;
  totalChildrenCount: Maybe<Scalars['Int']['output']>;
};


export type CommitactivityArgs = {
  actionType?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['DateTime']['input']>;
  before?: InputMaybe<Scalars['DateTime']['input']>;
  cursor?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
};

export type CommitCollection = {
  __typename?: 'CommitCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Maybe<Array<Commit>>;
  totalCount: Scalars['Int']['output'];
};

export type CommitCreateInput = {
  branchName: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  objectId: Scalars['String']['input'];
  parents?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sourceApplication?: InputMaybe<Scalars['String']['input']>;
  streamId: Scalars['String']['input'];
  totalChildrenCount?: InputMaybe<Scalars['Int']['input']>;
};

export type CommitDeleteInput = {
  id: Scalars['String']['input'];
  streamId: Scalars['String']['input'];
};

export type CommitReceivedInput = {
  commitId: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  sourceApplication: Scalars['String']['input'];
  streamId: Scalars['String']['input'];
};

export type CommitUpdateInput = {
  id: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  /** To move the commit to a different branch, please the name of the branch. */
  newBranchName?: InputMaybe<Scalars['String']['input']>;
  streamId: Scalars['String']['input'];
};

export type CommitsDeleteInput = {
  commitIds: Array<Scalars['String']['input']>;
  streamId: Scalars['ID']['input'];
};

export type CommitsMoveInput = {
  commitIds: Array<Scalars['String']['input']>;
  streamId: Scalars['ID']['input'];
  targetBranch: Scalars['String']['input'];
};

/**
 * Can be used instead of a full item collection, when the implementation doesn't call for it yet. Because
 * of the structure, it can be swapped out to a full item collection in the future
 */
export type CountOnlyCollection = {
  __typename?: 'CountOnlyCollection';
  totalCount: Scalars['Int']['output'];
};

export type CreateAccSyncItemInput = {
  accFileExtension: Scalars['String']['input'];
  accFileLineageUrn: Scalars['String']['input'];
  accFileName: Scalars['String']['input'];
  accFileVersionIndex: Scalars['Int']['input'];
  accFileVersionUrn: Scalars['String']['input'];
  accFileViewName?: InputMaybe<Scalars['String']['input']>;
  accFolderPath: Array<Scalars['String']['input']>;
  accHubId: Scalars['String']['input'];
  accProjectId: Scalars['String']['input'];
  accRegion: Scalars['String']['input'];
  accRootProjectFolderUrn: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};

export type CreateAutomateFunctionInput = {
  description: Scalars['String']['input'];
  /** Base64 encoded image data string */
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** GitHub organization to create the repository in */
  org?: InputMaybe<Scalars['String']['input']>;
  /** SourceAppNames values from @speckle/shared */
  supportedSourceApps: Array<Scalars['String']['input']>;
  tags: Array<Scalars['String']['input']>;
  template: AutomateFunctionTemplateLanguage;
};

export type CreateAutomateFunctionWithoutVersionInput = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateCommentInput = {
  content: CommentContentInput;
  projectId: Scalars['String']['input'];
  /** Resources that this comment should be attached to */
  resourceIdString: Scalars['String']['input'];
  screenshot?: InputMaybe<Scalars['String']['input']>;
  /**
   * SerializedViewerState. If omitted, comment won't render (correctly) inside the
   * viewer, but will still be retrievable through the API
   */
  viewerState?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type CreateCommentReplyInput = {
  content: CommentContentInput;
  projectId: Scalars['String']['input'];
  threadId: Scalars['String']['input'];
};

export type CreateDashboardShareTokenInput = {
  dashboardId: Scalars['String']['input'];
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
};

export type CreateDashboardTokenReturn = {
  __typename?: 'CreateDashboardTokenReturn';
  token: Scalars['String']['output'];
  tokenMetadata: DashboardToken;
};

export type CreateEmbedShareTokenInput = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['String']['input'];
  /**
   * The model(s) and version(s) string used in the embed url.
   * Format: 'modelId1,modelId2@versionId'
   */
  resourceIdString: Scalars['String']['input'];
};

export type CreateEmbedTokenReturn = {
  __typename?: 'CreateEmbedTokenReturn';
  token: Scalars['String']['output'];
  tokenMetadata: EmbedToken;
};

export type CreateFromTemplateInput = {
  modelIds: Array<Scalars['String']['input']>;
  /** Override the template's name for this insight */
  name?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['String']['input'];
  templateId: Scalars['String']['input'];
};

export type CreateIssueInput = {
  assigneeId?: InputMaybe<Scalars['ID']['input']>;
  attachmentBlobIds?: InputMaybe<Array<Scalars['String']['input']>>;
  /** ProseMirror document object */
  description?: InputMaybe<Scalars['JSONObject']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  /** Supported in workspaced projects only. Use Workspace.issueLabels to get available labels. */
  labelIds?: InputMaybe<Array<Scalars['String']['input']>>;
  priority?: InputMaybe<IssuePriority>;
  projectId: Scalars['ID']['input'];
  /**
   * Resources of the project that this issue should be attached to. Empty means - general project issue, not tied
   * to any resources.
   */
  resourceIdString?: InputMaybe<Scalars['String']['input']>;
  screenshot?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<IssueStatus>;
  title: Scalars['String']['input'];
  /** SerializedViewerState (type in @speckle/shared) */
  viewerState?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type CreateIssueLabelInput = {
  hexColor: Scalars['String']['input'];
  name: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type CreateIssueReplyInput = {
  attachmentBlobIds?: InputMaybe<Array<Scalars['String']['input']>>;
  /** ProseMirror document object */
  description?: InputMaybe<Scalars['JSONObject']['input']>;
  issueId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};

export type CreateModelInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};

export type CreatePresentationShareTokenInput = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['String']['input'];
  savedViewGroupId: Scalars['String']['input'];
};

export type CreateProjectLabelInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  /** Omit to create a group (no color) */
  hexColor?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** Omit for a top-level label or group */
  parentLabelId?: InputMaybe<Scalars['ID']['input']>;
  workspaceId: Scalars['ID']['input'];
};

export type CreateResourceMetaInput = {
  data: Scalars['JSON']['input'];
  metaType: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['String']['input']>;
  resourceId: Scalars['String']['input'];
  resourceType: ResourceMetaType;
  workspaceId: Scalars['String']['input'];
};

export type CreateSavedViewGroupInput = {
  /** Will default to auto-generated group name otherwise */
  groupName?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
  resourceIdString: Scalars['String']['input'];
};

export type CreateSavedViewInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  /** Group id, if grouping necessary */
  groupId?: InputMaybe<Scalars['ID']['input']>;
  /** Optionally also set this as the home/default view for the target model */
  isHomeView?: InputMaybe<Scalars['Boolean']['input']>;
  /** Auto-generated name, if not specified */
  name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<ViewPositionInput>;
  projectId: Scalars['ID']['input'];
  resourceIdString: Scalars['String']['input'];
  /** Encoded screenshot of the view */
  screenshot: Scalars['String']['input'];
  /**
   * SerializedViewerState. If omitted, comment won't render (correctly) inside the
   * viewer, but will still be retrievable through the API
   */
  viewerState: Scalars['JSONObject']['input'];
  /** Set visibility of the view. Default: public */
  visibility?: InputMaybe<SavedViewVisibility>;
};

export type CreateServerRegionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateSyncInput = {
  context?: InputMaybe<Scalars['JSONObject']['input']>;
  fileExtension: Scalars['String']['input'];
  fileFolderPath?: InputMaybe<Array<Scalars['String']['input']>>;
  fileId: Scalars['String']['input'];
  fileName: Scalars['String']['input'];
  fileParentFolderId?: InputMaybe<Scalars['String']['input']>;
  integration: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};

export type CreateUserEmailInput = {
  email: Scalars['String']['input'];
};

export type CreateVersionInput = {
  message?: InputMaybe<Scalars['String']['input']>;
  modelId: Scalars['String']['input'];
  objectId: Scalars['String']['input'];
  parents?: InputMaybe<Array<Scalars['String']['input']>>;
  projectId: Scalars['String']['input'];
  sourceApplication?: InputMaybe<Scalars['String']['input']>;
  totalChildrenCount?: InputMaybe<Scalars['Int']['input']>;
};

export enum Currency {
  gbp = 'gbp',
  usd = 'usd'
}

export type CurrencyBasedPrices = {
  __typename?: 'CurrencyBasedPrices';
  usd: WorkspacePaidPlanPrices;
};

export type Dashboard = {
  __typename?: 'Dashboard';
  createdAt: Scalars['DateTime']['output'];
  createdBy: Maybe<LimitedUser>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  permissions: DashboardPermissionChecks;
  projects: Array<LimitedProject>;
  /** @deprecated Use Project.shareTokens with sourceType: dashboard. Field will be deleted on November 1st, 2026. */
  shareLink: Maybe<DashboardShareLink>;
  /** If null, this is a new dashboard and should be initialized by the client */
  state: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  workspace: LimitedWorkspace;
};

export type DashboardCollection = {
  __typename?: 'DashboardCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Dashboard>;
  totalCount: Scalars['Int']['output'];
};

export type DashboardCreateInput = {
  name: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['String']['input']>;
};

export type DashboardMutations = {
  __typename?: 'DashboardMutations';
  create: Dashboard;
  createToken: CreateDashboardTokenReturn;
  delete: Scalars['Boolean']['output'];
  /** @deprecated Use sharingMutations.createDashboardShareToken / revokeShareToken. Field will be deleted on November 1st, 2026. */
  deleteShare: Scalars['Boolean']['output'];
  /** @deprecated Use sharingMutations.createDashboardShareToken / revokeShareToken. Field will be deleted on November 1st, 2026. */
  disableShare: DashboardShareLink;
  duplicate: Dashboard;
  /** @deprecated Use sharingMutations.createDashboardShareToken / revokeShareToken. Field will be deleted on November 1st, 2026. */
  enableShare: DashboardShareLink;
  /** @deprecated Use sharingMutations.createDashboardShareToken / revokeShareToken. Field will be deleted on November 1st, 2026. */
  share: DashboardShareLink;
  update: Dashboard;
};


export type DashboardMutationscreateArgs = {
  input: DashboardCreateInput;
  workspace: WorkspaceIdentifier;
};


export type DashboardMutationscreateTokenArgs = {
  dashboardId: Scalars['String']['input'];
};


export type DashboardMutationsdeleteArgs = {
  id: Scalars['String']['input'];
};


export type DashboardMutationsdeleteShareArgs = {
  input: DashboardShareInput;
};


export type DashboardMutationsdisableShareArgs = {
  input: DashboardShareInput;
};


export type DashboardMutationsduplicateArgs = {
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


export type DashboardMutationsenableShareArgs = {
  input: DashboardShareInput;
};


export type DashboardMutationsshareArgs = {
  dashboardId: Scalars['String']['input'];
};


export type DashboardMutationsupdateArgs = {
  input: DashboardUpdateInput;
};

export type DashboardPermissionChecks = {
  __typename?: 'DashboardPermissionChecks';
  canAccessModelValidation: PermissionCheckResult;
  canCreateToken: PermissionCheckResult;
  canDelete: PermissionCheckResult;
  canDuplicate: PermissionCheckResult;
  canEdit: PermissionCheckResult;
  canRead: PermissionCheckResult;
  canUpdateProjects: PermissionCheckResult;
  canUseExperimentalFeatures: PermissionCheckResult;
};

export type DashboardProjectLink = {
  automationId?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['String']['input'];
};

export type DashboardShareInput = {
  dashboardId: Scalars['ID']['input'];
  shareId: Scalars['ID']['input'];
};

export type DashboardShareLink = {
  __typename?: 'DashboardShareLink';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  revoked: Scalars['Boolean']['output'];
  validUntil: Scalars['DateTime']['output'];
};

export type DashboardToken = {
  __typename?: 'DashboardToken';
  createdAt: Scalars['DateTime']['output'];
  dashboard: Dashboard;
  lastUsed: Scalars['DateTime']['output'];
  lifespan: Scalars['BigInt']['output'];
  projects: Array<Project>;
  tokenId: Scalars['String']['output'];
  user: Maybe<LimitedUser>;
};

export type DashboardTokenCollection = {
  __typename?: 'DashboardTokenCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<DashboardToken>;
  totalCount: Scalars['Int']['output'];
};

export type DashboardTokenCreateInput = {
  dashboardId: Scalars['String']['input'];
  lifespan?: InputMaybe<Scalars['BigInt']['input']>;
};

export type DashboardUpdateInput = {
  dashboardProjectLinks?: InputMaybe<Array<DashboardProjectLink>>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  /** Project ids will be removed in the future, for now we'll keep double writing. */
  projectIds?: InputMaybe<Array<Scalars['String']['input']>>;
  state?: InputMaybe<Scalars['String']['input']>;
};

export type DataSourceColumn = {
  __typename?: 'DataSourceColumn';
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type DataSourceRefInput = {
  alias: Scalars['String']['input'];
  dataSourceId: Scalars['String']['input'];
};

export type DateIntervalFilter = {
  after?: InputMaybe<Scalars['DateTime']['input']>;
  before?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DeleteAccSyncItemInput = {
  id: Scalars['ID']['input'];
  projectId: Scalars['String']['input'];
};

export type DeleteIssueInput = {
  issueId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};

export type DeleteIssueLabelInput = {
  labelId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type DeleteModelInput = {
  id: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};

export type DeleteProjectLabelInput = {
  labelId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type DeleteResourceMetaInput = {
  projectId?: InputMaybe<Scalars['String']['input']>;
  resourceMetaId: Scalars['ID']['input'];
  workspaceId: Scalars['String']['input'];
};

export type DeleteSavedViewGroupInput = {
  groupId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};

export type DeleteSavedViewInput = {
  id: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};

export type DeleteSyncInput = {
  id: Scalars['ID']['input'];
  projectId: Scalars['String']['input'];
};

export type DeleteUserEmailInput = {
  id: Scalars['ID']['input'];
};

export type DeleteVersionsInput = {
  projectId: Scalars['ID']['input'];
  versionIds: Array<Scalars['ID']['input']>;
};

export type DenyWorkspaceJoinRequestInput = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export enum DiscoverableStreamsSortType {
  CREATED_DATE = 'CREATED_DATE',
  FAVORITES_COUNT = 'FAVORITES_COUNT'
}

export type DiscoverableStreamsSortingInput = {
  direction: SortDirection;
  type: DiscoverableStreamsSortType;
};

export type EditCommentInput = {
  commentId: Scalars['String']['input'];
  content: CommentContentInput;
  projectId: Scalars['String']['input'];
};

export type EmailVerificationRequestInput = {
  id: Scalars['ID']['input'];
};

/** A token used to enable an embedded viewer for a private project */
export type EmbedToken = {
  __typename?: 'EmbedToken';
  createdAt: Scalars['DateTime']['output'];
  lastUsed: Scalars['DateTime']['output'];
  lifespan: Scalars['BigInt']['output'];
  projectId: Scalars['String']['output'];
  resourceIdString: Scalars['String']['output'];
  tokenId: Scalars['String']['output'];
  user: Maybe<LimitedUser>;
};

export type EmbedTokenCollection = {
  __typename?: 'EmbedTokenCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<EmbedToken>;
  totalCount: Scalars['Int']['output'];
};

export type EmbedTokenCreateInput = {
  lifespan?: InputMaybe<Scalars['BigInt']['input']>;
  projectId: Scalars['String']['input'];
  /** The model(s) and version(s) string used in the embed url */
  resourceIdString: Scalars['String']['input'];
};

export type EnableWorkspaceScimInput = {
  workspaceId: Scalars['String']['input'];
};

export type ExecuteQueryInput = {
  dataSources?: InputMaybe<Array<DataSourceRefInput>>;
  modelIds: Array<Scalars['String']['input']>;
  projectId: Scalars['String']['input'];
  query: Scalars['JSONObject']['input'];
};

export type ExecuteQueryResult = {
  __typename?: 'ExecuteQueryResult';
  aggregate: ModelExecutionResult;
  perModel: Array<ModelExecutionResult>;
};

export type ExecuteVersionQueryInput = {
  dataSources?: InputMaybe<Array<DataSourceRefInput>>;
  modelId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  query: Scalars['JSONObject']['input'];
  versionId: Scalars['String']['input'];
};

export type ExtendedViewerResources = {
  __typename?: 'ExtendedViewerResources';
  /** The groups of viewer resources themselves */
  groups: Array<ViewerResourceGroup>;
  /** Metadata about the request that was made to resolve this. */
  request: ExtendedViewerResourcesRequest;
  /** Final/adjusted/resolved resource id string */
  resourceIdString: Scalars['String']['output'];
  /**
   * The saved view that was used, if any. Even if no savedViewId was specified, a home view could
   * have been implicitly loaded.
   */
  savedView: Maybe<SavedView>;
};

export type ExtendedViewerResourcesRequest = {
  __typename?: 'ExtendedViewerResourcesRequest';
  /** Specific id that was requested or null if loaded implicit (undefined req) or nothing (null req) */
  savedViewId: Maybe<Scalars['ID']['output']>;
};

export type ExternalDataSource = {
  __typename?: 'ExternalDataSource';
  columns: Array<DataSourceColumn>;
  createdAt: Scalars['DateTime']['output'];
  filename: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  projectId: Maybe<Scalars['String']['output']>;
  rowCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workspaceId: Scalars['String']['output'];
};

export type FileImportResultInput = {
  /** Duration of the file download before parsing started in seconds */
  downloadDurationSeconds: Scalars['Float']['input'];
  /** Total processing time in seconds, since job was picked up until it completed */
  durationSeconds: Scalars['Float']['input'];
  /** Duration of the transformation in seconds */
  parseDurationSeconds: Scalars['Float']['input'];
  /** Parser used for import */
  parser: Scalars['String']['input'];
  /** Version associated if applicable */
  versionId?: InputMaybe<Scalars['String']['input']>;
};

export type FileUpload = {
  __typename?: 'FileUpload';
  branchName: Scalars['String']['output'];
  /** If present, the conversion result is stored in this commit. */
  convertedCommitId: Maybe<Scalars['String']['output']>;
  convertedLastUpdate: Scalars['DateTime']['output'];
  /** Holds any errors or info. */
  convertedMessage: Maybe<Scalars['String']['output']>;
  /** 0 = queued, 1 = processing, 2 = success, 3 = error */
  convertedStatus: Scalars['Int']['output'];
  /** Alias for convertedCommitId */
  convertedVersionId: Maybe<Scalars['String']['output']>;
  fileName: Scalars['String']['output'];
  fileSize: Scalars['Int']['output'];
  fileType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** Model associated with the file upload, if it exists already */
  model: Maybe<Model>;
  modelId: Maybe<Scalars['String']['output']>;
  /** Alias for branchName */
  modelName: Scalars['String']['output'];
  /** Alias for streamId */
  projectId: Scalars['String']['output'];
  streamId: Scalars['String']['output'];
  /** Date when upload was last updated */
  updatedAt: Scalars['DateTime']['output'];
  uploadComplete: Scalars['Boolean']['output'];
  uploadDate: Scalars['DateTime']['output'];
  /** The user's id that uploaded this file. */
  userId: Scalars['String']['output'];
};

export type FileUploadCollection = {
  __typename?: 'FileUploadCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<FileUpload>;
  totalCount: Scalars['Int']['output'];
};

export type FileUploadMutations = {
  __typename?: 'FileUploadMutations';
  /**
   * **For internal service usage**
   * Marks the file import flow as completed for that specific job
   * recording the provided status, and emitting the needed subscriptions.
   */
  finishFileImport: Scalars['Boolean']['output'];
  /**
   * Generate a pre-signed url to which a file can be uploaded.
   * After uploading the file, call mutation startFileIngestion to register the completed upload.
   */
  generateUploadUrl: GenerateFileUploadUrlOutput;
  /**
   * Before calling this mutation, call generateUploadUrl to get the
   * pre-signed url and blobId. Then upload the file to that url.
   * Once the upload to the pre-signed url is completed, this mutation should be
   * called to register the completed upload and create the blob metadata.
   * @deprecated We now offer a common interface for all data ingestion. Use the startModelIngestion mutation instead. Will be removed on or after 2026-06-01
   */
  startFileImport: FileUpload;
  /**
   * Before calling this mutation, call generateUploadUrl to get the
   * pre-signed url and blobId. Then upload the file to that url.
   * Once the upload to the pre-signed url is completed, this mutation should be
   * called to register the completed upload and create the blob metadata.
   */
  startFileIngestion: ModelIngestion;
};


export type FileUploadMutationsfinishFileImportArgs = {
  input: FinishFileImportInput;
};


export type FileUploadMutationsgenerateUploadUrlArgs = {
  input: GenerateFileUploadUrlInput;
};


export type FileUploadMutationsstartFileImportArgs = {
  input: StartFileImportInput;
};


export type FileUploadMutationsstartFileIngestionArgs = {
  input: StartFileImportInput;
};

export type FinishFileImportInput = {
  /**
   * This is the blob Id of the uploaded file. For legacy reasons it is named jobId.
   * Note: This is the not the background job Id.
   */
  jobId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  result: FileImportResultInput;
  status: JobResultStatus;
  warnings?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type GenerateFileUploadUrlInput = {
  fileName: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};

export type GenerateFileUploadUrlOutput = {
  __typename?: 'GenerateFileUploadUrlOutput';
  /** The additional headers which must be sent with the PUT upload request to the returned url. */
  additionalRequestHeaders: Array<AdditionalRequestHeader>;
  /** The id of the file upload. This id must be used in subsequent calls to startFileImport. */
  fileId: Scalars['String']['output'];
  /** The pre-signed url to which the file must be uploaded. */
  url: Scalars['String']['output'];
};

export type GetModelUploadsInput = {
  /** The cursor for pagination. */
  cursor?: InputMaybe<Scalars['String']['input']>;
  /** The maximum number of uploads to return. */
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type GetUngroupedViewGroupInput = {
  /** Viewer resource ID string that identifies which resources should be loaded */
  resourceIdString: Scalars['String']['input'];
};

export type HasHandlerType = {
  handlerType: ModelIngestionHandlerType;
};

export type HasModelIngestionStatus = {
  status: ModelIngestionStatus;
};

export type HasProgressMessage = {
  progressMessage: Scalars['String']['output'];
};

/** For representing users that may have been deleted */
export type HistoricalUser = {
  __typename?: 'HistoricalUser';
  id: Scalars['ID']['output'];
  user: Maybe<LimitedUser>;
};

export type IngestionHistoryInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type Insight = {
  __typename?: 'Insight';
  /**
   * Aggregate results across all tracked models (newest first).
   * Use limit=1 for KPI badge.
   */
  aggregateResults: Array<InsightResult>;
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  customized: Scalars['Boolean']['output'];
  dataSources: Array<InsightDataSourceLink>;
  /** For rulesets: count of packages created from this ruleset. Returns 0 for non-rulesets. */
  derivedPackageCount: Scalars['Int']['output'];
  /** Version history (previous snapshots) */
  history: Array<InsightVersion>;
  id: Scalars['String']['output'];
  /** Latest result per model (excludes aggregate) */
  latestResults: Array<InsightResult>;
  metadata: Scalars['JSONObject']['output'];
  modelIds: Array<Scalars['String']['output']>;
  /** Historical results for a specific model (newest first) */
  modelResults: Array<InsightResult>;
  name: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  query: Scalars['JSONObject']['output'];
  /** For packages: the project ruleset this was created from (null if ad-hoc or ruleset deleted) */
  sourceRuleset: Maybe<Insight>;
  /** The template this insight was created from (null if ad-hoc or template deleted) */
  template: Maybe<InsightTemplate>;
  /** Which template version was snapshotted at creation/last sync */
  templateVersion: Maybe<Scalars['Int']['output']>;
  trigger: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedBy: Maybe<Scalars['String']['output']>;
  version: Scalars['Int']['output'];
  /** Stored results for a specific version */
  versionResults: Array<InsightResult>;
};


export type InsightaggregateResultsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type InsightmodelResultsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  modelId: Scalars['String']['input'];
};


export type InsightversionResultsArgs = {
  modelId: Scalars['String']['input'];
  versionId: Scalars['String']['input'];
};

export type InsightCreateInput = {
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  modelIds?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  query: Scalars['JSONObject']['input'];
  trigger?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type InsightDataSourceLink = {
  __typename?: 'InsightDataSourceLink';
  alias: Scalars['String']['output'];
  dataSource: Maybe<ExternalDataSource>;
  dataSourceId: Scalars['String']['output'];
  insightId: Scalars['String']['output'];
};

export type InsightMutations = {
  __typename?: 'InsightMutations';
  addModels: Insight;
  create: Insight;
  /** Create an insight by snapshotting a workspace template */
  createFromTemplate: Insight;
  delete: Scalars['Boolean']['output'];
  /** Execute a query ad-hoc against selected models (preview, no persistence) */
  executeQuery: ExecuteQueryResult;
  /** Execute a query against a single specific version of a model */
  executeVersionQuery: VersionQueryResult;
  linkDataSource: Scalars['Boolean']['output'];
  removeModel: Insight;
  /** Reset a customized insight back to its template's latest version */
  resetToTemplate: Insight;
  /** Rollback an insight to a previous version */
  rollbackInsight: Insight;
  update: Insight;
};


export type InsightMutationsaddModelsArgs = {
  insightId: Scalars['String']['input'];
  modelIds: Array<Scalars['String']['input']>;
  projectId: Scalars['String']['input'];
};


export type InsightMutationscreateArgs = {
  input: InsightCreateInput;
};


export type InsightMutationscreateFromTemplateArgs = {
  input: CreateFromTemplateInput;
};


export type InsightMutationsdeleteArgs = {
  id: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type InsightMutationsexecuteQueryArgs = {
  input: ExecuteQueryInput;
};


export type InsightMutationsexecuteVersionQueryArgs = {
  input: ExecuteVersionQueryInput;
};


export type InsightMutationslinkDataSourceArgs = {
  alias: Scalars['String']['input'];
  dataSourceId: Scalars['String']['input'];
  insightId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type InsightMutationsremoveModelArgs = {
  insightId: Scalars['String']['input'];
  modelId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type InsightMutationsresetToTemplateArgs = {
  insightId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type InsightMutationsrollbackInsightArgs = {
  insightId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  toVersion: Scalars['Int']['input'];
};


export type InsightMutationsupdateArgs = {
  input: InsightUpdateInput;
};

export type InsightResult = {
  __typename?: 'InsightResult';
  id: Scalars['String']['output'];
  insightId: Scalars['String']['output'];
  modelId: Maybe<Scalars['String']['output']>;
  result: Scalars['JSONObject']['output'];
  summary: Scalars['JSONObject']['output'];
  timestamp: Scalars['DateTime']['output'];
  versionId: Maybe<Scalars['String']['output']>;
};

export type InsightTemplate = {
  __typename?: 'InsightTemplate';
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  description: Maybe<Scalars['String']['output']>;
  /** Version history (previous snapshots) */
  history: Array<InsightTemplateVersion>;
  id: Scalars['String']['output'];
  metadata: Scalars['JSONObject']['output'];
  name: Scalars['String']['output'];
  query: Scalars['JSONObject']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedBy: Scalars['String']['output'];
  version: Scalars['Int']['output'];
  workspaceId: Scalars['String']['output'];
};

export type InsightTemplateCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  name: Scalars['String']['input'];
  query: Scalars['JSONObject']['input'];
  type: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type InsightTemplateMutations = {
  __typename?: 'InsightTemplateMutations';
  create: InsightTemplate;
  delete: Scalars['Boolean']['output'];
  rollback: InsightTemplate;
  update: InsightTemplate;
};


export type InsightTemplateMutationscreateArgs = {
  input: InsightTemplateCreateInput;
};


export type InsightTemplateMutationsdeleteArgs = {
  id: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type InsightTemplateMutationsrollbackArgs = {
  id: Scalars['String']['input'];
  toVersion: Scalars['Int']['input'];
  workspaceId: Scalars['String']['input'];
};


export type InsightTemplateMutationsupdateArgs = {
  input: InsightTemplateUpdateInput;
};

export type InsightTemplateUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** If true, propagate changes to all non-customized insights using this template */
  propagateToInsights?: InputMaybe<Scalars['Boolean']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};

export type InsightTemplateVersion = {
  __typename?: 'InsightTemplateVersion';
  metadata: Scalars['JSONObject']['output'];
  name: Scalars['String']['output'];
  query: Scalars['JSONObject']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedBy: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

export type InsightUpdateInput = {
  id: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['String']['input'];
  query?: InputMaybe<Scalars['JSONObject']['input']>;
  trigger?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type InsightVersion = {
  __typename?: 'InsightVersion';
  customized: Scalars['Boolean']['output'];
  metadata: Scalars['JSONObject']['output'];
  name: Scalars['String']['output'];
  query: Scalars['JSONObject']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedBy: Maybe<Scalars['String']['output']>;
  version: Scalars['Int']['output'];
};

/** Integration info resolved from static config */
export type Integration = {
  __typename?: 'Integration';
  description: Maybe<Scalars['String']['output']>;
  logo: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  slug: Scalars['ID']['output'];
};

export type InvitableCollaboratorsFilter = {
  search?: InputMaybe<Scalars['String']['input']>;
};

export enum InviteUseType {
  accept = 'accept',
  decline = 'decline'
}

export type Invoice = {
  __typename?: 'Invoice';
  paymentUrl: Scalars['String']['output'];
};

export type Issue = {
  __typename?: 'Issue';
  /** All the recent activity on this issue order by createdAt */
  activities: Maybe<IssueActivityCollection>;
  assignee: Maybe<IssueParticipant>;
  /** Could be deleted - set to null */
  author: Maybe<IssueParticipant>;
  createdAt: Scalars['DateTime']['output'];
  /** ProseMirror document object */
  description: Maybe<SmartTextEditorValue>;
  dueDate: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  /** Human-readable unique identifier for the issue within the project */
  identifier: Scalars['String']['output'];
  labels: Array<AssignedLabel>;
  /** Sequence number for the issue */
  number: Scalars['Int']['output'];
  permissions: IssuePermissionChecks;
  previewUrl: Scalars['String']['output'];
  priority: IssuePriority;
  projectId: Scalars['ID']['output'];
  /** Description in plaintext */
  rawDescription: Maybe<Scalars['String']['output']>;
  replies: IssueReplyCollection;
  /** Get authors of replies to this issue */
  replyAuthors: IssueParticipantCollection;
  /** Undefined means - not tied to any particular project resource */
  resourceIdString: Maybe<Scalars['String']['output']>;
  status: IssueStatus;
  thumbnailUrl: Scalars['String']['output'];
  /** Full issue timeline with replies and activities mixed together in one list */
  timeline: IssueTimelineCollection;
  title: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  /** The last time you viewed this issue. Present only if an auth'ed request. */
  viewedAt: Maybe<Scalars['DateTime']['output']>;
  viewerState: Maybe<Scalars['JSONObject']['output']>;
  workspaceId: Maybe<Scalars['ID']['output']>;
};


export type IssueactivitiesArgs = {
  input?: InputMaybe<IssueActivityInput>;
};


export type IssuerepliesArgs = {
  input?: InputMaybe<IssueRepliesInput>;
};


export type IssuereplyAuthorsArgs = {
  limit?: Scalars['Int']['input'];
};


export type IssuetimelineArgs = {
  input?: InputMaybe<IssueTimelineInput>;
};

export type IssueActivity = {
  __typename?: 'IssueActivity';
  actor: Maybe<IssueParticipant>;
  createdAt: Scalars['DateTime']['output'];
  eventType: IssueActivityEventType;
  id: Scalars['ID']['output'];
  payload: Maybe<IssueActivityPayload>;
};

export type IssueActivityCollection = {
  __typename?: 'IssueActivityCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<IssueActivity>;
  totalCount: Scalars['Int']['output'];
};

export enum IssueActivityEventType {
  created = 'created',
  replyCreated = 'replyCreated',
  updated = 'updated'
}

/** Represents a group of collapsed consecutive activity events */
export type IssueActivityGroup = {
  __typename?: 'IssueActivityGroup';
  /** All activities that were collapsed into this group */
  activities: Array<IssueActivity>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** The type of activities in this group (e.g., 'updated') */
  type: IssueActivityEventType;
};

export type IssueActivityInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  /** Activity issue events to exclude from the response */
  excludedEvents?: InputMaybe<Array<IssueActivityEventType>>;
  /**
   * Maximum 50
   * Default: 25
   */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Default sorting order is desc */
  sortDirection?: InputMaybe<SortOrder>;
};

export type IssueActivityPayload = IssueOtherActivityPayload | IssueUpdatedActivityPayload;

export type IssueCollection = {
  __typename?: 'IssueCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Issue>;
  totalCount: Scalars['Int']['output'];
};

export type IssueLabel = {
  __typename?: 'IssueLabel';
  /** Null, if deleted */
  author: Maybe<LimitedUser>;
  createdAt: Scalars['DateTime']['output'];
  hexColor: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastUsedAt: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type IssueLabelCollection = {
  __typename?: 'IssueLabelCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<IssueLabel>;
  totalCount: Scalars['Int']['output'];
};

/** Fallback type for any payloads w/o specifically typed structures */
export type IssueOtherActivityPayload = {
  __typename?: 'IssueOtherActivityPayload';
  version: Maybe<Scalars['String']['output']>;
};

export type IssueParticipant = {
  __typename?: 'IssueParticipant';
  id: Scalars['ID']['output'];
  user: LimitedUser;
};

export type IssueParticipantCollection = {
  __typename?: 'IssueParticipantCollection';
  items: Array<IssueParticipant>;
  totalCount: Scalars['Int']['output'];
};

export type IssuePermissionChecks = {
  __typename?: 'IssuePermissionChecks';
  canDelete: PermissionCheckResult;
  canEditAssignee: PermissionCheckResult;
  canEditDescription: PermissionCheckResult;
  canEditDueDate: PermissionCheckResult;
  canEditLabels: PermissionCheckResult;
  canEditPriority: PermissionCheckResult;
  canEditStatus: PermissionCheckResult;
  canEditTitle: PermissionCheckResult;
};

export enum IssuePriority {
  high = 'high',
  low = 'low',
  medium = 'medium',
  none = 'none'
}

export type IssueRepliesInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  /**
   * Maximum 50
   * Default: 25
   */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Specify the field to sort by.
   * Default: createdAt
   */
  sortBy?: InputMaybe<ProjectIssueRepliesSortBy>;
  /** Default: asc */
  sortDirection?: InputMaybe<SortOrder>;
};

export type IssueReply = {
  __typename?: 'IssueReply';
  /** Could be deleted - set to null */
  author: Maybe<IssueParticipant>;
  createdAt: Scalars['DateTime']['output'];
  /** ProseMirror document object */
  description: Maybe<SmartTextEditorValue>;
  id: Scalars['ID']['output'];
  issueId: Scalars['ID']['output'];
  projectId: Scalars['ID']['output'];
  rawDescription: Maybe<Scalars['String']['output']>;
};

export type IssueReplyCollection = {
  __typename?: 'IssueReplyCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<IssueReply>;
  totalCount: Scalars['Int']['output'];
};

export enum IssueStatus {
  open = 'open',
  readyForReview = 'readyForReview',
  resolved = 'resolved'
}

export type IssueTimelineCollection = {
  __typename?: 'IssueTimelineCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<IssueTimelineItem>;
};

export type IssueTimelineInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  /**
   * Activity issue events to exclude from the response
   * Note: Updated/ReplyCreated are always auto-excluded
   */
  excludedEvents?: InputMaybe<Array<IssueActivityEventType>>;
  /**
   * Maximum 50
   * Default: 10
   */
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type IssueTimelineItem = IssueActivity | IssueActivityGroup | IssueReply;

/** before/after values are only set for fields that were changed */
export type IssueUpdatedActivityPayload = {
  __typename?: 'IssueUpdatedActivityPayload';
  assigneeAfter: Maybe<HistoricalUser>;
  assigneeBefore: Maybe<HistoricalUser>;
  descriptionAfter: Maybe<SmartTextEditorValue>;
  descriptionBefore: Maybe<SmartTextEditorValue>;
  dueDateAfter: Maybe<Scalars['DateTime']['output']>;
  dueDateBefore: Maybe<Scalars['DateTime']['output']>;
  is3DDataReferenceChanged: Maybe<Scalars['Boolean']['output']>;
  labelsAdded: Maybe<Array<Scalars['String']['output']>>;
  labelsAfter: Maybe<Array<Scalars['String']['output']>>;
  labelsBefore: Maybe<Array<Scalars['String']['output']>>;
  labelsRemoved: Maybe<Array<Scalars['String']['output']>>;
  priorityAfter: Maybe<IssuePriority>;
  priorityBefore: Maybe<IssuePriority>;
  statusAfter: Maybe<IssueStatus>;
  statusBefore: Maybe<IssueStatus>;
  titleAfter: Maybe<Scalars['String']['output']>;
  titleBefore: Maybe<Scalars['String']['output']>;
};

export enum JobResultStatus {
  error = 'error',
  success = 'success'
}

export type JoinWorkspaceInput = {
  workspaceId: Scalars['ID']['input'];
};

export type LegacyCommentViewerData = {
  __typename?: 'LegacyCommentViewerData';
  /**
   * An array representing a user's camera position:
   * [camPos.x, camPos.y, camPos.z, camTarget.x, camTarget.y, camTarget.z, isOrtho, zoomNumber]
   */
  camPos: Array<Scalars['Float']['output']>;
  /** Old FE LocalFilterState type */
  filters: CommentDataFilters;
  /** THREE.Vector3 {x, y, z} */
  location: Scalars['JSONObject']['output'];
  /** Viewer.getCurrentSectionBox(): THREE.Box3 */
  sectionBox: Maybe<Scalars['JSONObject']['output']>;
  /** Currently unused. Ideally comments should keep track of selected objects. */
  selection: Maybe<Scalars['JSONObject']['output']>;
};

export type LimitedProject = {
  __typename?: 'LimitedProject';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions: ProjectPermissionChecks;
};

/**
 * Limited user type, for showing public info about a user
 * to another user
 */
export type LimitedUser = {
  __typename?: 'LimitedUser';
  /**
   * All the recent activity from this user in chronological order
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  activity: Maybe<ActivityCollection>;
  avatar: Maybe<Scalars['String']['output']>;
  bio: Maybe<Scalars['String']['output']>;
  /**
   * Get public stream commits authored by the user
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  commits: Maybe<CommitCollection>;
  company: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: Maybe<Scalars['String']['output']>;
  /**
   * Returns all discoverable streams that the user is a collaborator on
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  streams: UserStreamCollection;
  /**
   * The user's timeline in chronological order
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  timeline: Maybe<ActivityCollection>;
  /**
   * Total amount of favorites attached to streams owned by the user
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  totalOwnedStreamsFavorites: Scalars['Int']['output'];
  verified: Maybe<Scalars['Boolean']['output']>;
  workspaceDomainPolicyCompliant: Maybe<Scalars['Boolean']['output']>;
  workspaceRole: Maybe<Scalars['String']['output']>;
};


/**
 * Limited user type, for showing public info about a user
 * to another user
 */
export type LimitedUseractivityArgs = {
  actionType?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['DateTime']['input']>;
  before?: InputMaybe<Scalars['DateTime']['input']>;
  cursor?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
};


/**
 * Limited user type, for showing public info about a user
 * to another user
 */
export type LimitedUsercommitsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


/**
 * Limited user type, for showing public info about a user
 * to another user
 */
export type LimitedUserstreamsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


/**
 * Limited user type, for showing public info about a user
 * to another user
 */
export type LimitedUsertimelineArgs = {
  after?: InputMaybe<Scalars['DateTime']['input']>;
  before?: InputMaybe<Scalars['DateTime']['input']>;
  cursor?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
};


/**
 * Limited user type, for showing public info about a user
 * to another user
 */
export type LimitedUserworkspaceDomainPolicyCompliantArgs = {
  workspaceSlug?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Limited user type, for showing public info about a user
 * to another user
 */
export type LimitedUserworkspaceRoleArgs = {
  workspaceId?: InputMaybe<Scalars['String']['input']>;
};

/** Workspace metadata visible to non-workspace members. */
export type LimitedWorkspace = {
  __typename?: 'LimitedWorkspace';
  /** Workspace admins ordered by join date */
  adminTeam: Array<LimitedWorkspaceCollaborator>;
  /** Workspace description */
  description: Maybe<Scalars['String']['output']>;
  /** If true, the users with a matching domain may join the workspace directly */
  discoverabilityAutoJoinEnabled: Scalars['Boolean']['output'];
  /** Workspace id */
  id: Scalars['ID']['output'];
  /**
   * Optional base64 encoded workspace logo image
   * @deprecated Use the `workspace.logoUrl` field instead. Will be removed after June 2026.
   */
  logo: Maybe<Scalars['String']['output']>;
  /** URL for pulling the workspace logo image */
  logoUrl: Maybe<Scalars['String']['output']>;
  /** Workspace name */
  name: Scalars['String']['output'];
  /** Workspace permissions */
  permissions: WorkspacePermissionChecks;
  /** Active user's role for this workspace. `null` if request is not authenticated, or the workspace is not explicitly shared with you. */
  role: Maybe<Scalars['String']['output']>;
  /** Unique workspace short id. Used for navigation. */
  slug: Scalars['String']['output'];
  /** Workspace members visible to people with verified email domain */
  team: Maybe<LimitedWorkspaceCollaboratorCollection>;
};


/** Workspace metadata visible to non-workspace members. */
export type LimitedWorkspaceteamArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};

export type LimitedWorkspaceCollaborator = {
  __typename?: 'LimitedWorkspaceCollaborator';
  user: LimitedUser;
};

export type LimitedWorkspaceCollaboratorCollection = {
  __typename?: 'LimitedWorkspaceCollaboratorCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<LimitedWorkspaceCollaborator>;
  totalCount: Scalars['Int']['output'];
};

export type LimitedWorkspaceJoinRequest = {
  __typename?: 'LimitedWorkspaceJoinRequest';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  status: WorkspaceJoinRequestStatus;
  user: LimitedUser;
  workspace: LimitedWorkspace;
};

export type LimitedWorkspaceJoinRequestCollection = {
  __typename?: 'LimitedWorkspaceJoinRequestCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<LimitedWorkspaceJoinRequest>;
  totalCount: Scalars['Int']['output'];
};

export type MarkCommentViewedInput = {
  commentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};

export type MarkIssueViewedInput = {
  issueId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};

export type MarkReceivedVersionInput = {
  /** Set to true, if receive is done in an embedded context (iFrame), potentially outside of the main application. */
  isEmbed?: InputMaybe<Scalars['Boolean']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['String']['input'];
  /** Source application that received the version. */
  sourceApplication: Scalars['String']['input'];
  versionId: Scalars['String']['input'];
  /** Set to true, if the version was received w/ a shared public token */
  withSharedToken?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MigrateLegacySyncInput = {
  id: Scalars['ID']['input'];
  projectId: Scalars['String']['input'];
};

export type MigrateProjectInput = {
  /** Optional cap on the number of versions to enqueue. Server-side max is 5000. */
  limit?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['ID']['input'];
};

export type MigrateVersionInput = {
  projectId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
};

export type Model = {
  __typename?: 'Model';
  /** @deprecated Use Model.sync instead. */
  accSyncItem: Maybe<AccSyncItem>;
  author: Maybe<LimitedUser>;
  automationsStatus: Maybe<TriggeredAutomationsStatus>;
  /** Return a model tree of children */
  childrenTree: Array<ModelsTreeItem>;
  /**
   * All comment threads in this model
   * @deprecated Comments were moved to issues. Use project.issues instead. Field will be removed after 01 Jun 2026.
   */
  commentThreads: CommentCollection;
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  /** The shortened/display name that doesn't include the names of parent models */
  displayName: Scalars['String']['output'];
  /** The model's home view, if any */
  homeView: Maybe<SavedView>;
  id: Scalars['ID']['output'];
  ingestionHistory: ModelIngestionHistory;
  latestIngestion: Maybe<ModelIngestion>;
  /** Full name including the names of parent models delimited by forward slashes */
  name: Scalars['String']['output'];
  /** Returns a list of versions that are being created from a file import */
  pendingImportedVersions: Array<FileUpload>;
  permissions: ModelPermissionChecks;
  previewUrl: Maybe<Scalars['String']['output']>;
  projectId: Scalars['String']['output'];
  /** The resourceIdString to use when building links to this model in the viewer. Takes home view settings into account. */
  resourceIdString: Scalars['String']['output'];
  sync: Maybe<Sync>;
  updatedAt: Scalars['DateTime']['output'];
  /** Get all file uploads ever done in this model */
  uploads: FileUploadCollection;
  version: Version;
  versions: VersionCollection;
};


export type ModelcommentThreadsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type ModelingestionHistoryArgs = {
  input?: InputMaybe<IngestionHistoryInput>;
};


export type ModelpendingImportedVersionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type ModeluploadsArgs = {
  input?: InputMaybe<GetModelUploadsInput>;
};


export type ModelversionArgs = {
  id: Scalars['String']['input'];
};


export type ModelversionsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ModelVersionsFilter>;
  limit?: Scalars['Int']['input'];
};

export type ModelCollection = {
  __typename?: 'ModelCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Model>;
  totalCount: Scalars['Int']['output'];
};

export type ModelExecutionResult = {
  __typename?: 'ModelExecutionResult';
  durationMs: Scalars['Int']['output'];
  modelId: Maybe<Scalars['String']['output']>;
  result: Scalars['JSONObject']['output'];
  summary: Scalars['JSONObject']['output'];
  versionId: Maybe<Scalars['String']['output']>;
};

export type ModelIngestion = {
  __typename?: 'ModelIngestion';
  authorUser: Maybe<LimitedUser>;
  cancellationRequested: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  handler: ModelIngestionHandler;
  id: Scalars['ID']['output'];
  modelId: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  sourceData: Maybe<SourceData>;
  statusData: ModelIngestionStatusData;
  updatedAt: Scalars['DateTime']['output'];
  userId: Maybe<Scalars['String']['output']>;
};

export type ModelIngestionAccHandler = HasHandlerType & {
  __typename?: 'ModelIngestionAccHandler';
  automationId: Scalars['String']['output'];
  automationRunId: Scalars['String']['output'];
  handlerType: ModelIngestionHandlerType;
};

export type ModelIngestionAutomateFileUpload = HasHandlerType & {
  __typename?: 'ModelIngestionAutomateFileUpload';
  automationId: Scalars['String']['output'];
  automationRunId: Scalars['String']['output'];
  blobId: Scalars['String']['output'];
  handlerType: ModelIngestionHandlerType;
};

export type ModelIngestionCancelledInput = {
  cancellationMessage: Scalars['String']['input'];
  ingestionId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};

export type ModelIngestionCancelledStatus = HasModelIngestionStatus & {
  __typename?: 'ModelIngestionCancelledStatus';
  cancellationMessage: Scalars['String']['output'];
  status: ModelIngestionStatus;
};

export type ModelIngestionClientHandler = HasHandlerType & {
  __typename?: 'ModelIngestionClientHandler';
  handlerType: ModelIngestionHandlerType;
};

export type ModelIngestionCreateInput = {
  maxIdleTimeoutSeconds?: InputMaybe<Scalars['Int']['input']>;
  modelId: Scalars['ID']['input'];
  /** Initial message displayed on the start of the ingestion process. */
  progressMessage: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  sourceData: SourceDataInput;
};

export type ModelIngestionFailedInput = {
  errorReason: Scalars['String']['input'];
  errorStacktrace?: InputMaybe<Scalars['String']['input']>;
  ingestionId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};

export type ModelIngestionFailedStatus = HasModelIngestionStatus & {
  __typename?: 'ModelIngestionFailedStatus';
  errorReason: Scalars['String']['output'];
  errorStacktrace: Maybe<Scalars['String']['output']>;
  status: ModelIngestionStatus;
};

export type ModelIngestionFileUploadHandler = HasHandlerType & {
  __typename?: 'ModelIngestionFileUploadHandler';
  blobId: Scalars['String']['output'];
  handlerType: ModelIngestionHandlerType;
};

export type ModelIngestionHandler = ModelIngestionAccHandler | ModelIngestionAutomateFileUpload | ModelIngestionClientHandler | ModelIngestionFileUploadHandler;

export enum ModelIngestionHandlerType {
  acc = 'acc',
  automateFileUpload = 'automateFileUpload',
  clientSide = 'clientSide',
  dataUpload = 'dataUpload',
  fileUpload = 'fileUpload',
  projectWise = 'projectWise'
}

export type ModelIngestionHistory = {
  __typename?: 'ModelIngestionHistory';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<ModelIngestion>;
  totalCount: Scalars['Int']['output'];
};

export type ModelIngestionInvalidInput = {
  ingestionId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
  validationMessage: Scalars['String']['input'];
  validationOptions?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type ModelIngestionInvalidStatus = HasModelIngestionStatus & {
  __typename?: 'ModelIngestionInvalidStatus';
  status: ModelIngestionStatus;
  validationMessage: Scalars['String']['output'];
  validationOptions: Maybe<Scalars['JSONObject']['output']>;
};

export type ModelIngestionProcessingStatus = HasModelIngestionStatus & HasProgressMessage & {
  __typename?: 'ModelIngestionProcessingStatus';
  progress: Maybe<Scalars['Float']['output']>;
  progressMessage: Scalars['String']['output'];
  status: ModelIngestionStatus;
};

export type ModelIngestionQueuedStatus = HasModelIngestionStatus & HasProgressMessage & {
  __typename?: 'ModelIngestionQueuedStatus';
  progressMessage: Scalars['String']['output'];
  status: ModelIngestionStatus;
};

export type ModelIngestionReference = {
  ingestionId?: InputMaybe<Scalars['ID']['input']>;
  modelId?: InputMaybe<Scalars['ID']['input']>;
};

export type ModelIngestionRequestCancellationInput = {
  cancellationMessage: Scalars['String']['input'];
  ingestionId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};

export type ModelIngestionRequeueInput = {
  ingestionId: Scalars['ID']['input'];
  progressMessage: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};

export type ModelIngestionStartProcessingInput = {
  ingestionId: Scalars['ID']['input'];
  progressMessage: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
  sourceData: SourceDataInput;
};

export enum ModelIngestionStatus {
  cancelled = 'cancelled',
  failed = 'failed',
  invalidInput = 'invalidInput',
  processing = 'processing',
  queued = 'queued',
  success = 'success',
  timeout = 'timeout'
}

export type ModelIngestionStatusData = ModelIngestionCancelledStatus | ModelIngestionFailedStatus | ModelIngestionInvalidStatus | ModelIngestionProcessingStatus | ModelIngestionQueuedStatus | ModelIngestionSuccessStatus;

export type ModelIngestionSuccessInput = {
  ingestionId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
  rootObjectId: Scalars['ID']['input'];
  versionMessage?: InputMaybe<Scalars['String']['input']>;
};

export type ModelIngestionSuccessStatus = HasModelIngestionStatus & {
  __typename?: 'ModelIngestionSuccessStatus';
  status: ModelIngestionStatus;
  versionId: Scalars['ID']['output'];
};

export type ModelIngestionUpdateInput = {
  ingestionId: Scalars['ID']['input'];
  progress?: InputMaybe<Scalars['Float']['input']>;
  progressMessage: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};

export type ModelMutations = {
  __typename?: 'ModelMutations';
  create: Model;
  delete: Scalars['Boolean']['output'];
  update: Model;
};


export type ModelMutationscreateArgs = {
  input: CreateModelInput;
};


export type ModelMutationsdeleteArgs = {
  input: DeleteModelInput;
};


export type ModelMutationsupdateArgs = {
  input: UpdateModelInput;
};

export type ModelPermissionChecks = {
  __typename?: 'ModelPermissionChecks';
  canCreateIngestion: PermissionCheckResult;
  canCreateVersion: PermissionCheckResult;
  canDelete: PermissionCheckResult;
  canUpdate: PermissionCheckResult;
};

export type ModelVersionsFilter = {
  /** Make sure these specified versions are always loaded first */
  priorityIds?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Only return versions specified in `priorityIds` */
  priorityIdsOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ModelsTreeItem = {
  __typename?: 'ModelsTreeItem';
  children: Array<ModelsTreeItem>;
  fullName: Scalars['String']['output'];
  /** Whether or not this item has nested children models */
  hasChildren: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  /**
   * Nullable cause the item can represent a parent that doesn't actually exist as a model on its own.
   * E.g. A model named "foo/bar" is supposed to be a child of "foo" and will be represented as such,
   * even if "foo" doesn't exist as its own model.
   */
  model: Maybe<Model>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ModelsTreeItemCollection = {
  __typename?: 'ModelsTreeItemCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<ModelsTreeItem>;
  totalCount: Scalars['Int']['output'];
};

export type MoveVersionsInput = {
  projectId: Scalars['ID']['input'];
  /** If the name references a nonexistant model, it will be created */
  targetModelName: Scalars['String']['input'];
  versionIds: Array<Scalars['ID']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** The void stares back. */
  _: Maybe<Scalars['String']['output']>;
  /** @deprecated Use Mutation.syncMutations instead. */
  accSyncItemMutations: AccSyncItemMutations;
  /** Various Active User oriented mutations */
  activeUserMutations: ActiveUserMutations;
  admin: AdminMutations;
  adminDeleteUser: Scalars['Boolean']['output'];
  /** Creates an personal api token. */
  apiTokenCreate: Scalars['String']['output'];
  /** Revokes (deletes) an personal api token/app token. */
  apiTokenRevoke: Scalars['Boolean']['output'];
  /** Register a new third party application. */
  appCreate: Scalars['String']['output'];
  /** Deletes a thirty party application. */
  appDelete: Scalars['Boolean']['output'];
  /** Revokes (de-authorizes) an application that you have previously authorized. */
  appRevokeAccess: Maybe<Scalars['Boolean']['output']>;
  /** Create an app token. Only apps can create app tokens and they don't show up under personal access tokens. */
  appTokenCreate: Scalars['String']['output'];
  /** Update an existing third party application. **Note: This will invalidate all existing tokens, refresh tokens and access codes and will require existing users to re-authorize it.** */
  appUpdate: Scalars['Boolean']['output'];
  automateFunctionRunStatusReport: Scalars['Boolean']['output'];
  automateMutations: AutomateMutations;
  /** @deprecated Part of the old API surface and will be removed in the future. Use ModelMutations.create instead. */
  branchCreate: Scalars['String']['output'];
  /** @deprecated Part of the old API surface and will be removed in the future. Use ModelMutations.delete instead. */
  branchDelete: Scalars['Boolean']['output'];
  /** @deprecated Part of the old API surface and will be removed in the future. Use ModelMutations.update instead. */
  branchUpdate: Scalars['Boolean']['output'];
  /** Broadcast user activity in the viewer */
  broadcastViewerUserActivity: Scalars['Boolean']['output'];
  /** @deprecated Comments were moved to issues. Use ProjectIssueMutations instead. This mutation will be removed after 01 Jun 2026. */
  commentMutations: CommentMutations;
  /** @deprecated Part of the old API surface and will be removed in the future. Use VersionMutations.create instead. */
  commitCreate: Scalars['String']['output'];
  /** @deprecated Part of the old API surface and will be removed in the future. Use VersionMutations.delete instead. */
  commitDelete: Scalars['Boolean']['output'];
  /** @deprecated Part of the old API surface and will be removed in the future. Use VersionMutations.markReceived instead. */
  commitReceive: Scalars['Boolean']['output'];
  /** @deprecated Part of the old API surface and will be removed in the future. Use VersionMutations.update/moveToModel instead. */
  commitUpdate: Scalars['Boolean']['output'];
  /**
   * Delete a batch of commits
   * @deprecated Part of the old API surface and will be removed in the future. Use VersionMutations.delete instead.
   */
  commitsDelete: Scalars['Boolean']['output'];
  /**
   * Move a batch of commits to a new branch
   * @deprecated Part of the old API surface and will be removed in the future. Use VersionMutations.moveToModel instead.
   */
  commitsMove: Scalars['Boolean']['output'];
  dashboardMutations: DashboardMutations;
  fileUploadMutations: FileUploadMutations;
  insightMutations: InsightMutations;
  insightTemplateMutations: InsightTemplateMutations;
  /**
   * Delete a pending invite
   * Note: The required scope to invoke this is not given out to app or personal access tokens
   */
  inviteDelete: Scalars['Boolean']['output'];
  /**
   * Re-send a pending invite
   * Note: The required scope to invoke this is not given out to app or personal access tokens
   */
  inviteResend: Scalars['Boolean']['output'];
  modelMutations: ModelMutations;
  notificationMutations: NotificationMutations;
  /** @deprecated Part of the old API surface and will be removed in the future. */
  objectCreate: Array<Scalars['String']['output']>;
  powerTools: PowerToolsMutations;
  projectMutations: ProjectMutations;
  /** (Re-)send the account verification e-mail */
  requestVerification: SentEmailInfo;
  requestVerificationByEmail: SentEmailInfo;
  resourceMetaMutations: ResourceMetaMutations;
  serverInfoMutations: ServerInfoMutations;
  serverInfoUpdate: Maybe<Scalars['Boolean']['output']>;
  /** Note: The required scope to invoke this is not given out to app or personal access tokens */
  serverInviteBatchCreate: Scalars['Boolean']['output'];
  /** Invite a new user to the speckle server and return the invite ID */
  serverInviteCreate: Scalars['Boolean']['output'];
  sharingMutations: SharingMutations;
  /**
   * Request access to a specific stream
   * @deprecated Part of the old API surface and will be removed in the future. Use ProjectAccessRequestMutations.create instead.
   */
  streamAccessRequestCreate: StreamAccessRequest;
  /**
   * Accept or decline a stream access request. Must be a stream owner to invoke this.
   * @deprecated Part of the old API surface and will be removed in the future. Use ProjectAccessRequestMutations.use instead.
   */
  streamAccessRequestUse: Scalars['Boolean']['output'];
  /**
   * Creates a new stream.
   * @deprecated Part of the old API surface and will be removed in the future. Use ProjectMutations.create instead.
   */
  streamCreate: Maybe<Scalars['String']['output']>;
  /** @deprecated Part of the old API surface and will be removed in the future. */
  streamFavorite: Maybe<Stream>;
  /**
   * Accept or decline a stream invite
   * @deprecated Part of the old API surface and will be removed in the future. Use ProjectInviteMutations.use instead.
   */
  streamInviteUse: Scalars['Boolean']['output'];
  /**
   * Remove yourself from stream collaborators (not possible for the owner)
   * @deprecated Part of the old API surface and will be removed in the future. Use ProjectMutations.leave instead.
   */
  streamLeave: Scalars['Boolean']['output'];
  /**
   * Updates an existing stream.
   * @deprecated Part of the old API surface and will be removed in the future. Use ProjectMutations.update instead.
   */
  streamUpdate: Scalars['Boolean']['output'];
  syncMutations: SyncMutations;
  /** Delete a user's account. */
  userDelete: Scalars['Boolean']['output'];
  userNotificationPreferencesUpdate: Maybe<Scalars['Boolean']['output']>;
  userRoleChange: Scalars['Boolean']['output'];
  /**
   * Edits a user's profile.
   * @deprecated Use activeUserMutations version
   */
  userUpdate: Scalars['Boolean']['output'];
  versionMutations: VersionMutations;
  /** Creates a new webhook on a stream */
  webhookCreate: Scalars['String']['output'];
  /** Deletes an existing webhook */
  webhookDelete: Scalars['String']['output'];
  /** Updates an existing webhook */
  webhookUpdate: Scalars['String']['output'];
  workspaceJoinRequestMutations: WorkspaceJoinRequestMutations;
  workspaceMutations: WorkspaceMutations;
};


export type MutationadminDeleteUserArgs = {
  userConfirmation: UserDeleteInput;
};


export type MutationapiTokenCreateArgs = {
  token: ApiTokenCreateInput;
};


export type MutationapiTokenRevokeArgs = {
  token: Scalars['String']['input'];
};


export type MutationappCreateArgs = {
  app: AppCreateInput;
};


export type MutationappDeleteArgs = {
  appId: Scalars['String']['input'];
};


export type MutationappRevokeAccessArgs = {
  appId: Scalars['String']['input'];
};


export type MutationappTokenCreateArgs = {
  token: AppTokenCreateInput;
};


export type MutationappUpdateArgs = {
  app: AppUpdateInput;
};


export type MutationautomateFunctionRunStatusReportArgs = {
  input: AutomateFunctionRunStatusReportInput;
};


export type MutationbranchCreateArgs = {
  branch: BranchCreateInput;
};


export type MutationbranchDeleteArgs = {
  branch: BranchDeleteInput;
};


export type MutationbranchUpdateArgs = {
  branch: BranchUpdateInput;
};


export type MutationbroadcastViewerUserActivityArgs = {
  message: ViewerUserActivityMessageInput;
  projectId: Scalars['String']['input'];
  resourceIdString: Scalars['String']['input'];
};


export type MutationcommitCreateArgs = {
  commit: CommitCreateInput;
};


export type MutationcommitDeleteArgs = {
  commit: CommitDeleteInput;
};


export type MutationcommitReceiveArgs = {
  input: CommitReceivedInput;
};


export type MutationcommitUpdateArgs = {
  commit: CommitUpdateInput;
};


export type MutationcommitsDeleteArgs = {
  input: CommitsDeleteInput;
};


export type MutationcommitsMoveArgs = {
  input: CommitsMoveInput;
};


export type MutationinviteDeleteArgs = {
  inviteId: Scalars['String']['input'];
};


export type MutationinviteResendArgs = {
  inviteId: Scalars['String']['input'];
};


export type MutationobjectCreateArgs = {
  objectInput: ObjectCreateInput;
};


export type MutationrequestVerificationByEmailArgs = {
  email: Scalars['String']['input'];
};


export type MutationserverInfoUpdateArgs = {
  info: ServerInfoUpdateInput;
};


export type MutationserverInviteBatchCreateArgs = {
  input: Array<ServerInviteCreateInput>;
};


export type MutationserverInviteCreateArgs = {
  input: ServerInviteCreateInput;
};


export type MutationstreamAccessRequestCreateArgs = {
  streamId: Scalars['String']['input'];
};


export type MutationstreamAccessRequestUseArgs = {
  accept: Scalars['Boolean']['input'];
  requestId: Scalars['String']['input'];
  role?: StreamRole;
};


export type MutationstreamCreateArgs = {
  stream: StreamCreateInput;
};


export type MutationstreamFavoriteArgs = {
  favorited: Scalars['Boolean']['input'];
  streamId: Scalars['String']['input'];
};


export type MutationstreamInviteUseArgs = {
  accept: Scalars['Boolean']['input'];
  streamId: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationstreamLeaveArgs = {
  streamId: Scalars['String']['input'];
};


export type MutationstreamUpdateArgs = {
  stream: StreamUpdateInput;
};


export type MutationuserDeleteArgs = {
  userConfirmation: UserDeleteInput;
};


export type MutationuserNotificationPreferencesUpdateArgs = {
  preferences: Scalars['JSONObject']['input'];
};


export type MutationuserRoleChangeArgs = {
  userRoleInput: UserRoleInput;
};


export type MutationuserUpdateArgs = {
  user: UserUpdateInput;
};


export type MutationwebhookCreateArgs = {
  webhook: WebhookCreateInput;
};


export type MutationwebhookDeleteArgs = {
  webhook: WebhookDeleteInput;
};


export type MutationwebhookUpdateArgs = {
  webhook: WebhookUpdateInput;
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  payload: Scalars['JSONObject']['output'];
  read: Scalars['Boolean']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type NotificationMutations = {
  __typename?: 'NotificationMutations';
  /** Delete an existing notification */
  bulkDelete: Scalars['Boolean']['output'];
  /** update notidication */
  bulkUpdate: Scalars['Boolean']['output'];
};


export type NotificationMutationsbulkDeleteArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type NotificationMutationsbulkUpdateArgs = {
  input: Array<NotificationUpdateInput>;
};

export type NotificationUpdateInput = {
  id: Scalars['ID']['input'];
  read: Scalars['Boolean']['input'];
};

export type Object = {
  __typename?: 'Object';
  /** @deprecated Not implemented. */
  applicationId: Maybe<Scalars['String']['output']>;
  /**
   * Get any objects that this object references. In the case of commits, this will give you a commit's constituent objects.
   * **NOTE**: Providing any of the two last arguments ( `query`, `orderBy` ) will trigger a different code branch that executes a much more expensive SQL query. It is not recommended to do so for basic clients that are interested in purely getting all the objects of a given commit.
   */
  children: ObjectCollection;
  /**
   * The total number of comments for this commit. To actually get the comments, use the comments query and pass in a resource array consisting of of this object's id.
   * E.g.,
   * ```
   * query{
   *   comments(streamId:"streamId" resources:[{resourceType: object, resourceId:"objectId"}] ){
   *     ...
   *   }
   * ```
   * @deprecated Part of the old API surface and will be removed in the future. Always returns 0.
   */
  commentCount: Scalars['Int']['output'];
  createdAt: Maybe<Scalars['DateTime']['output']>;
  /** The full object, with all its props & other things. **NOTE:** If you're requesting objects for the purpose of recreating & displaying, you probably only want to request this specific field. */
  data: Maybe<Scalars['JSONObject']['output']>;
  id: Scalars['String']['output'];
  speckleType: Maybe<Scalars['String']['output']>;
  totalChildrenCount: Maybe<Scalars['Int']['output']>;
};


export type ObjectchildrenArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  depth?: Scalars['Int']['input'];
  limit?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Scalars['JSONObject']['input']>;
  query?: InputMaybe<Array<Scalars['JSONObject']['input']>>;
  select?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ObjectCollection = {
  __typename?: 'ObjectCollection';
  cursor: Maybe<Scalars['String']['output']>;
  objects: Array<Object>;
  totalCount: Scalars['Int']['output'];
};

export type ObjectCreateInput = {
  /** The objects you want to create. */
  objects: Array<InputMaybe<Scalars['JSONObject']['input']>>;
  /** The stream against which these objects will be created. */
  streamId: Scalars['String']['input'];
};

export type OnboardingCompletionInput = {
  /** The primary use case for how Speckle will help the user in their role */
  useCase?: InputMaybe<Scalars['String']['input']>;
};

export enum PaidWorkspacePlans {
  business = 'business'
}

export type PasswordStrengthCheckFeedback = {
  __typename?: 'PasswordStrengthCheckFeedback';
  suggestions: Array<Scalars['String']['output']>;
  warning: Maybe<Scalars['String']['output']>;
};

export type PasswordStrengthCheckResults = {
  __typename?: 'PasswordStrengthCheckResults';
  /** Verbal feedback to help choose better passwords. set when score <= 2. */
  feedback: PasswordStrengthCheckFeedback;
  /**
   * Integer from 0-4 (useful for implementing a strength bar):
   * 0 too guessable: risky password. (guesses < 10^3)
   * 1 very guessable: protection from throttled online attacks. (guesses < 10^6)
   * 2 somewhat guessable: protection from unthrottled online attacks. (guesses < 10^8)
   * 3 safely unguessable: moderate protection from offline slow-hash scenario. (guesses < 10^10)
   * 4 very unguessable: strong protection from offline slow-hash scenario. (guesses >= 10^10)
   */
  score: Scalars['Int']['output'];
};

export enum PaymentMethod {
  card = 'card',
  invoice = 'invoice'
}

export type PendingStreamCollaborator = {
  __typename?: 'PendingStreamCollaborator';
  id: Scalars['String']['output'];
  inviteId: Scalars['String']['output'];
  invitedBy: LimitedUser;
  /** The project this invite is for */
  project: Maybe<LimitedProject>;
  projectId: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  role: Scalars['String']['output'];
  /** @deprecated Use projectId instead */
  streamId: Scalars['String']['output'];
  /** @deprecated Use projectName instead */
  streamName: Scalars['String']['output'];
  /** E-mail address or name of the invited user */
  title: Scalars['String']['output'];
  /** Only available if the active user is the pending stream collaborator */
  token: Maybe<Scalars['String']['output']>;
  /** Set only if user is registered */
  user: Maybe<LimitedUser>;
  workspaceSlug: Maybe<Scalars['String']['output']>;
};

export type PendingWorkspaceCollaborator = {
  __typename?: 'PendingWorkspaceCollaborator';
  /**
   * E-mail address if target is unregistered or primary e-mail of target registered user
   * if token was specified to retrieve this invite
   */
  email: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  inviteId: Scalars['String']['output'];
  /** Nullable if inviter gets deleted */
  invitedBy: Maybe<LimitedUser>;
  /** Target workspace role */
  role: Scalars['String']['output'];
  /** E-mail address or name of the invited user */
  title: Scalars['String']['output'];
  /**
   * Only available if the active user is the pending workspace collaborator or if it was already
   * specified when retrieving this invite
   */
  token: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  /** Set only if user is registered */
  user: Maybe<LimitedUser>;
  workspace: LimitedWorkspace;
};

export type PendingWorkspaceCollaboratorsFilter = {
  search?: InputMaybe<Scalars['String']['input']>;
};

export type PermissionCheckResult = {
  __typename?: 'PermissionCheckResult';
  authorized: Scalars['Boolean']['output'];
  code: Scalars['String']['output'];
  /** Same as message, or undefined if check is authorized */
  errorMessage: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  payload: Maybe<Scalars['JSONObject']['output']>;
};

export type PlanAddOn = {
  quantity: Scalars['Int']['input'];
};

export type PowerToolsMutations = {
  __typename?: 'PowerToolsMutations';
  externalSync: AdminExternalSyncMutations;
};

export type Price = {
  __typename?: 'Price';
  amount: Scalars['Float']['output'];
  currency: Scalars['String']['output'];
  currencySymbol: Scalars['String']['output'];
};

export type Project = {
  __typename?: 'Project';
  /** @deprecated Use Project.sync instead. */
  accSyncItem: AccSyncItem;
  /** @deprecated Use Project.syncs instead. The generic syncs API supersedes the ACC-specific sync-items surface. */
  accSyncItems: AccSyncItemCollection;
  allowPublicComments: Scalars['Boolean']['output'];
  /** List of allowed assignees for this issue */
  allowedIssueAssignees: IssueParticipantCollection;
  /** When the project was archived. Null if the project is active. */
  archivedAt: Maybe<Scalars['DateTime']['output']>;
  /** Get a single automation by id. Error will be thrown if automation is not found or inaccessible. */
  automation: Automation;
  automations: AutomationCollection;
  blob: Maybe<BlobMetadata>;
  /** Get the metadata collection of blobs stored for this stream. */
  blobs: Maybe<BlobMetadataCollection>;
  /**
   * Get specific project comment/thread by ID
   * @deprecated Comments were moved to issues. Use project.issue / project.issueReply instead. Field will be removed after 01 Jun 2026.
   */
  comment: Maybe<Comment>;
  /**
   * All comment threads in this project
   * @deprecated Comments were moved to issues. Use project.issues instead. Field will be removed after 01 Jun 2026.
   */
  commentThreads: ProjectCommentCollection;
  createdAt: Scalars['DateTime']['output'];
  dashboardTokens: DashboardTokenCollection;
  dashboards: DashboardCollection;
  description: Maybe<Scalars['String']['output']>;
  /** Public project-level configuration for embedded viewer */
  embedOptions: ProjectEmbedOptions;
  /** @deprecated Part of the old API surface and will be removed in the future. Field will be deleted on October 1st, 2026. */
  embedTokens: EmbedTokenCollection;
  /** @deprecated Use specific auth policies instead */
  hasAccessToFeature: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  ingestion: Maybe<ModelIngestion>;
  invitableCollaborators: WorkspaceCollaboratorCollection;
  /** Collaborators who have been invited, but not yet accepted. */
  invitedTeam: Maybe<Array<PendingStreamCollaborator>>;
  /** Load a specific issue by ID */
  issue: Issue;
  /** List all issue labels available in this project */
  issueLabels: IssueLabelCollection;
  /** Issue prefix for this project */
  issuePrefix: Scalars['String']['output'];
  /** List issues for this project */
  issues: IssueCollection;
  /** Project labels assigned to this project */
  labels: Array<WorkspaceProjectLabel>;
  /** Limited workspace records that exposes public data projects workspaces. */
  limitedWorkspace: Maybe<LimitedWorkspace>;
  /** Returns a specific model by its ID */
  model: Model;
  /** Retrieve a specific project model by its ID */
  modelByName: Model;
  /** Return a model tree of children for the specified model name */
  modelChildrenTree: Array<ModelsTreeItem>;
  /** Returns a flat list of all models */
  models: ModelCollection;
  /**
   * Return's a project's models in a tree view with submodels being nested under parent models
   * real or fake (e.g., with a foo/bar model, it will be nested under foo even if such a model doesn't actually exist)
   */
  modelsTree: ModelsTreeItemCollection;
  /** Returns information about the potential effects of moving a project to a given workspace. */
  moveToWorkspaceDryRun: ProjectMoveToWorkspaceDryRun;
  name: Scalars['String']['output'];
  object: Maybe<Object>;
  /** Pending project access requests */
  pendingAccessRequests: Maybe<Array<ProjectAccessRequest>>;
  /** Returns a list models that are being created from a file import */
  pendingImportedModels: Array<FileUpload>;
  permissions: ProjectPermissionChecks;
  /** Active user's role for this project. `null` if request is not authenticated, or the project is not explicitly shared with you. */
  role: Maybe<Scalars['String']['output']>;
  savedView: SavedView;
  savedViewGroup: SavedViewGroup;
  savedViewGroups: SavedViewGroupCollection;
  /** Same as savedView(), but won't throw if view isn't found */
  savedViewIfExists: Maybe<SavedView>;
  savedViews: SavedViewCollection;
  shareTokens: ShareTokenCollection;
  /** Source apps used in any models of this project */
  sourceApps: Array<Scalars['String']['output']>;
  sync: Sync;
  syncs: SyncCollection;
  team: Array<ProjectCollaborator>;
  ungroupedViewGroup: SavedViewGroup;
  updatedAt: Scalars['DateTime']['output'];
  /** Retrieve a specific project version by its ID */
  version: Version;
  /** Returns a flat list of all project versions */
  versions: VersionCollection;
  /**
   * Return metadata about resources being requested in the viewer
   * @deprecated Use viewerResourcesExtended instead. viewerResources() will be removed soon
   */
  viewerResources: Array<ViewerResourceGroup>;
  /** Return extended metadata about resources being requested in the viewer */
  viewerResourcesExtended: ExtendedViewerResources;
  visibility: ProjectVisibility;
  webhooks: WebhookCollection;
  /** Full workspace information for the project. */
  workspace: Maybe<Workspace>;
  workspaceId: Maybe<Scalars['String']['output']>;
};


export type ProjectaccSyncItemArgs = {
  id: Scalars['String']['input'];
};


export type ProjectaccSyncItemsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type ProjectallowedIssueAssigneesArgs = {
  limit?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};


export type ProjectautomationArgs = {
  id: Scalars['String']['input'];
};


export type ProjectautomationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type ProjectblobArgs = {
  id: Scalars['String']['input'];
};


export type ProjectblobsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};


export type ProjectcommentArgs = {
  id: Scalars['String']['input'];
};


export type ProjectcommentThreadsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProjectCommentsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type ProjectdashboardTokensArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type ProjectdashboardsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProjectDashboardsFilter>;
  limit?: Scalars['Int']['input'];
};


export type ProjectembedTokensArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type ProjecthasAccessToFeatureArgs = {
  featureName: WorkspaceFeatureName;
};


export type ProjectingestionArgs = {
  id: Scalars['ID']['input'];
};


export type ProjectinvitableCollaboratorsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<InvitableCollaboratorsFilter>;
  limit?: Scalars['Int']['input'];
};


export type ProjectissueArgs = {
  id: Scalars['ID']['input'];
};


export type ProjectissueLabelsArgs = {
  input: WorkspaceIssueLabelsInput;
};


export type ProjectissuesArgs = {
  input?: InputMaybe<ProjectIssuesInput>;
};


export type ProjectmodelArgs = {
  id: Scalars['String']['input'];
};


export type ProjectmodelByNameArgs = {
  name: Scalars['String']['input'];
};


export type ProjectmodelChildrenTreeArgs = {
  fullName: Scalars['String']['input'];
};


export type ProjectmodelsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProjectModelsFilter>;
  limit?: Scalars['Int']['input'];
};


export type ProjectmodelsTreeArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProjectModelsTreeFilter>;
  limit?: Scalars['Int']['input'];
};


export type ProjectmoveToWorkspaceDryRunArgs = {
  workspaceId: Scalars['String']['input'];
};


export type ProjectobjectArgs = {
  id: Scalars['String']['input'];
};


export type ProjectpendingImportedModelsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type ProjectsavedViewArgs = {
  id: Scalars['ID']['input'];
};


export type ProjectsavedViewGroupArgs = {
  id: Scalars['ID']['input'];
};


export type ProjectsavedViewGroupsArgs = {
  input: SavedViewGroupsInput;
};


export type ProjectsavedViewIfExistsArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type ProjectsavedViewsArgs = {
  input: ProjectSavedViewsInput;
};


export type ProjectshareTokensArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProjectShareTokensFilter>;
  limit?: Scalars['Int']['input'];
};


export type ProjectsyncArgs = {
  id: Scalars['String']['input'];
};


export type ProjectsyncsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  integration?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type ProjectungroupedViewGroupArgs = {
  input: GetUngroupedViewGroupInput;
};


export type ProjectversionArgs = {
  id: Scalars['String']['input'];
};


export type ProjectversionsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type ProjectviewerResourcesArgs = {
  loadedVersionsOnly?: InputMaybe<Scalars['Boolean']['input']>;
  resourceIdString: Scalars['String']['input'];
  savedViewId?: InputMaybe<Scalars['ID']['input']>;
  savedViewSettings?: InputMaybe<SavedViewsLoadSettings>;
};


export type ProjectviewerResourcesExtendedArgs = {
  loadedVersionsOnly?: InputMaybe<Scalars['Boolean']['input']>;
  preloadResourceIdString?: InputMaybe<Scalars['String']['input']>;
  resourceIdString: Scalars['String']['input'];
  savedViewId?: InputMaybe<Scalars['ID']['input']>;
  savedViewSettings?: InputMaybe<SavedViewsLoadSettings>;
};


export type ProjectwebhooksArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectAccSyncItemsUpdatedMessage = {
  __typename?: 'ProjectAccSyncItemsUpdatedMessage';
  accSyncItem: Maybe<AccSyncItem>;
  id: Scalars['String']['output'];
  type: ProjectAccSyncItemsUpdatedMessageType;
};

export enum ProjectAccSyncItemsUpdatedMessageType {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  UPDATED = 'UPDATED'
}

/** Created when a user requests to become a contributor on a project */
export type ProjectAccessRequest = {
  __typename?: 'ProjectAccessRequest';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Can only be selected if authed user has proper access */
  project: Project;
  projectId: Scalars['String']['output'];
  requester: LimitedUser;
  requesterId: Scalars['String']['output'];
};

export type ProjectAccessRequestMutations = {
  __typename?: 'ProjectAccessRequestMutations';
  /** Request access to a specific project */
  create: ProjectAccessRequest;
  /** Accept or decline a project access request. Must be a project owner to invoke this. */
  use: Project;
};


export type ProjectAccessRequestMutationscreateArgs = {
  projectId: Scalars['String']['input'];
};


export type ProjectAccessRequestMutationsuseArgs = {
  accept: Scalars['Boolean']['input'];
  requestId: Scalars['String']['input'];
  role?: StreamRole;
};

export type ProjectAutomationCreateInput = {
  enabled: Scalars['Boolean']['input'];
  isTestAutomation?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type ProjectAutomationMutations = {
  __typename?: 'ProjectAutomationMutations';
  create: Automation;
  createRevision: AutomationRevision;
  createTestAutomation: Automation;
  createTestAutomationRun: TestAutomationRun;
  delete: Scalars['Boolean']['output'];
  /**
   * Trigger an automation with a fake "version created" trigger. The "version created" will
   * just refer to the last version of the model.
   */
  trigger: Scalars['String']['output'];
  update: Automation;
};


export type ProjectAutomationMutationscreateArgs = {
  input: ProjectAutomationCreateInput;
};


export type ProjectAutomationMutationscreateRevisionArgs = {
  input: ProjectAutomationRevisionCreateInput;
};


export type ProjectAutomationMutationscreateTestAutomationArgs = {
  input: ProjectTestAutomationCreateInput;
};


export type ProjectAutomationMutationscreateTestAutomationRunArgs = {
  automationId: Scalars['ID']['input'];
  versionId?: InputMaybe<Scalars['ID']['input']>;
};


export type ProjectAutomationMutationsdeleteArgs = {
  automationId: Scalars['ID']['input'];
};


export type ProjectAutomationMutationstriggerArgs = {
  automationId: Scalars['ID']['input'];
  versionId?: InputMaybe<Scalars['ID']['input']>;
};


export type ProjectAutomationMutationsupdateArgs = {
  input: ProjectAutomationUpdateInput;
};

export type ProjectAutomationRevisionCreateInput = {
  automationId: Scalars['ID']['input'];
  functions: Array<AutomationRevisionCreateFunctionInput>;
  /** AutomateTypes.TriggerDefinitionsSchema type from @speckle/shared */
  triggerDefinitions: Scalars['JSONObject']['input'];
};

export type ProjectAutomationUpdateInput = {
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectAutomationsUpdatedMessage = {
  __typename?: 'ProjectAutomationsUpdatedMessage';
  automation: Maybe<Automation>;
  automationId: Scalars['String']['output'];
  /** Only set if type === CREATED_REVISION */
  revision: Maybe<AutomationRevision>;
  type: ProjectAutomationsUpdatedMessageType;
};

export enum ProjectAutomationsUpdatedMessageType {
  CREATED = 'CREATED',
  CREATED_REVISION = 'CREATED_REVISION',
  UPDATED = 'UPDATED'
}

export type ProjectCollaborator = {
  __typename?: 'ProjectCollaborator';
  id: Scalars['ID']['output'];
  role: Scalars['String']['output'];
  /** The collaborator's workspace seat type for the workspace this project is in */
  seatType: Maybe<WorkspaceSeatType>;
  user: LimitedUser;
  /** The collaborator's workspace role for the workspace this project is in, if any */
  workspaceRole: Maybe<Scalars['String']['output']>;
};

export type ProjectCollection = {
  __typename?: 'ProjectCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Project>;
  totalCount: Scalars['Int']['output'];
};

export type ProjectCommentCollection = {
  __typename?: 'ProjectCommentCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Comment>;
  totalArchivedCount: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type ProjectCommentsFilter = {
  /** Whether or not to include archived/resolved threads */
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * By default if resourceIdString is set, the "versionId" part of model resource identifiers will be ignored
   * and all comments of all versions of any of the referenced models will be returned. If `loadedVersionsOnly` is
   * enabled, then only comment threads of loaded/referenced versions in resourceIdString will be returned.
   */
  loadedVersionsOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Only request comments belonging to the resources identified by this
   * comma-delimited resouce string (same format that's used in the viewer URL)
   */
  resourceIdString?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectCommentsUpdatedMessage = {
  __typename?: 'ProjectCommentsUpdatedMessage';
  /** Null if deleted */
  comment: Maybe<Comment>;
  id: Scalars['String']['output'];
  type: ProjectCommentsUpdatedMessageType;
};

export enum ProjectCommentsUpdatedMessageType {
  ARCHIVED = 'ARCHIVED',
  CREATED = 'CREATED',
  UPDATED = 'UPDATED'
}

/** Any values left null will be ignored */
export type ProjectCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<ProjectVisibility>;
};

export type ProjectDashboardsFilter = {
  search?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectEmbedOptions = {
  __typename?: 'ProjectEmbedOptions';
  hideSpeckleBranding: Scalars['Boolean']['output'];
};

export type ProjectFileImportUpdatedMessage = {
  __typename?: 'ProjectFileImportUpdatedMessage';
  /** Upload ID */
  id: Scalars['String']['output'];
  type: ProjectFileImportUpdatedMessageType;
  upload: FileUpload;
};

export enum ProjectFileImportUpdatedMessageType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED'
}

export type ProjectInviteCreateInput = {
  /** Either this or userId must be filled */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Defaults to the contributor role, if not specified */
  role?: InputMaybe<Scalars['String']['input']>;
  /** Can only be specified if guest mode is on or if the user is an admin */
  serverRole?: InputMaybe<Scalars['String']['input']>;
  /** Either this or email must be filled */
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectInviteMutations = {
  __typename?: 'ProjectInviteMutations';
  /** Batch invite to project */
  batchCreate: Project;
  /** Cancel a pending stream invite. Can only be invoked by a project owner. */
  cancel: Project;
  /** Invite a new or registered user to be a project collaborator. Can only be invoked by a project owner. */
  create: Project;
  /**
   * Create invite(-s) for a project in a workspace. Unlike the base create() mutation, this allows
   * configuring the workspace role.
   */
  createForWorkspace: Project;
  /** Accept or decline a project invite */
  use: Scalars['Boolean']['output'];
};


export type ProjectInviteMutationsbatchCreateArgs = {
  input: Array<ProjectInviteCreateInput>;
  projectId: Scalars['ID']['input'];
};


export type ProjectInviteMutationscancelArgs = {
  inviteId: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type ProjectInviteMutationscreateArgs = {
  input: ProjectInviteCreateInput;
  projectId: Scalars['ID']['input'];
};


export type ProjectInviteMutationscreateForWorkspaceArgs = {
  inputs: Array<WorkspaceProjectInviteCreateInput>;
  projectId: Scalars['ID']['input'];
};


export type ProjectInviteMutationsuseArgs = {
  input: ProjectInviteUseInput;
};

export type ProjectInviteUseInput = {
  accept: Scalars['Boolean']['input'];
  projectId: Scalars['ID']['input'];
  token: Scalars['String']['input'];
};

export type ProjectIssueMutations = {
  __typename?: 'ProjectIssueMutations';
  createIssue: Issue;
  createReply: IssueReply;
  deleteIssue: Scalars['Boolean']['output'];
  markIssueViewed: Scalars['Boolean']['output'];
  updateIssue: Issue;
};


export type ProjectIssueMutationscreateIssueArgs = {
  input: CreateIssueInput;
};


export type ProjectIssueMutationscreateReplyArgs = {
  input: CreateIssueReplyInput;
};


export type ProjectIssueMutationsdeleteIssueArgs = {
  input: DeleteIssueInput;
};


export type ProjectIssueMutationsmarkIssueViewedArgs = {
  input: MarkIssueViewedInput;
};


export type ProjectIssueMutationsupdateIssueArgs = {
  input: UpdateIssueInput;
};

export enum ProjectIssueRepliesSortBy {
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

export type ProjectIssuesInput = {
  /** Note: 'none' as an assigneeId will specifically look for unassigned issues */
  assigneeIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  createdAt?: InputMaybe<DateIntervalFilter>;
  cursor?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<DateIntervalFilter>;
  /** Supported in workspaced projects only. Use Workspace.issueLabels to get available labels. */
  labelIds?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Only load issues for actively loaded versions in resourceIdString.
   * Only applies if resourceIdString is set.
   */
  loadedVersionsOnly?: InputMaybe<Scalars['Boolean']['input']>;
  priorities?: InputMaybe<Array<IssuePriority>>;
  /** Optionally filter by project resources */
  resourceIdString?: InputMaybe<Scalars['String']['input']>;
  /** Filter by name/description */
  search?: InputMaybe<Scalars['String']['input']>;
  /**
   * Specify the field to sort by.
   * Default: updatedAt
   */
  sortBy?: InputMaybe<ProjectIssuesSortBy>;
  /** Default: desc */
  sortDirection?: InputMaybe<SortOrder>;
  statuses?: InputMaybe<Array<IssueStatus>>;
  updatedAt?: InputMaybe<DateIntervalFilter>;
};

export enum ProjectIssuesSortBy {
  createdAt = 'createdAt',
  dueDate = 'dueDate',
  priority = 'priority',
  status = 'status',
  updatedAt = 'updatedAt'
}

export type ProjectIssuesUpdatedMessage = {
  __typename?: 'ProjectIssuesUpdatedMessage';
  /** Issue ID */
  id: Scalars['ID']['output'];
  /** Null if issue was deleted */
  issue: Maybe<Issue>;
  /** The project that the update belongs to */
  project: Project;
  /** Only set if replyCreated event */
  reply: Maybe<IssueReply>;
  type: ProjectIssuesUpdatedMessageType;
};

export enum ProjectIssuesUpdatedMessageType {
  created = 'created',
  deleted = 'deleted',
  replyCreated = 'replyCreated',
  updated = 'updated'
}

export type ProjectModelIngestionMutations = {
  __typename?: 'ProjectModelIngestionMutations';
  completeWithVersion: ModelIngestion;
  /**
   * This will create an ingestion in a processing state.
   * Use this mutation if you want to create a client side ingestion sessions,
   * where the session creator is responsible for processing and completing the session.
   */
  create: ModelIngestion;
  failWithCancel: ModelIngestion;
  failWithError: ModelIngestion;
  failWithInvalid: ModelIngestion;
  requestCancellation: ModelIngestion;
  requeue: ModelIngestion;
  /**
   * This mutation will move an existing queued ingestion into the processing state.
   * Use this if you are given a reference to a pre created ingestion session and you want to start processing it.
   */
  startProcessing: ModelIngestion;
  updateProgress: ModelIngestion;
};


export type ProjectModelIngestionMutationscompleteWithVersionArgs = {
  input: ModelIngestionSuccessInput;
};


export type ProjectModelIngestionMutationscreateArgs = {
  input: ModelIngestionCreateInput;
};


export type ProjectModelIngestionMutationsfailWithCancelArgs = {
  input: ModelIngestionCancelledInput;
};


export type ProjectModelIngestionMutationsfailWithErrorArgs = {
  input: ModelIngestionFailedInput;
};


export type ProjectModelIngestionMutationsfailWithInvalidArgs = {
  input: ModelIngestionInvalidInput;
};


export type ProjectModelIngestionMutationsrequestCancellationArgs = {
  input: ModelIngestionRequestCancellationInput;
};


export type ProjectModelIngestionMutationsrequeueArgs = {
  input: ModelIngestionRequeueInput;
};


export type ProjectModelIngestionMutationsstartProcessingArgs = {
  input: ModelIngestionStartProcessingInput;
};


export type ProjectModelIngestionMutationsupdateProgressArgs = {
  input: ModelIngestionUpdateInput;
};

export type ProjectModelIngestionSubscriptionInput = {
  ingestionReference: ModelIngestionReference;
  messageType?: InputMaybe<ProjectModelIngestionUpdatedMessageType>;
  projectId: Scalars['ID']['input'];
};

export type ProjectModelIngestionUpdatedMessage = {
  __typename?: 'ProjectModelIngestionUpdatedMessage';
  modelIngestion: ModelIngestion;
  type: ProjectModelIngestionUpdatedMessageType;
};

export enum ProjectModelIngestionUpdatedMessageType {
  cancellationRequested = 'cancellationRequested',
  created = 'created',
  deleted = 'deleted',
  updated = 'updated'
}

export type ProjectModelsFilter = {
  /** Filter by IDs of contributors who participated in models */
  contributors?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Excldue models w/ the specified IDs */
  excludeIds?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Only select models w/ the specified IDs */
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Filter out models that don't have any versions */
  onlyWithVersions?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by model names */
  search?: InputMaybe<Scalars['String']['input']>;
  /** Filter by source apps used in models */
  sourceApps?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ProjectModelsTreeFilter = {
  /** Filter by IDs of contributors who participated in models */
  contributors?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Search for specific models. If used, tree items from different levels may be mixed. */
  search?: InputMaybe<Scalars['String']['input']>;
  /** Filter by source apps used in models */
  sourceApps?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ProjectModelsUpdatedMessage = {
  __typename?: 'ProjectModelsUpdatedMessage';
  /** Model ID */
  id: Scalars['String']['output'];
  /** Null if model was deleted */
  model: Maybe<Model>;
  type: ProjectModelsUpdatedMessageType;
};

export enum ProjectModelsUpdatedMessageType {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  UPDATED = 'UPDATED'
}

export type ProjectMoveToWorkspaceDryRun = {
  __typename?: 'ProjectMoveToWorkspaceDryRun';
  addedToWorkspace: Array<LimitedUser>;
  addedToWorkspaceTotalCount: Scalars['Int']['output'];
};


export type ProjectMoveToWorkspaceDryRunaddedToWorkspaceArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type ProjectMutations = {
  __typename?: 'ProjectMutations';
  /** Access request related mutations */
  accessRequestMutations: ProjectAccessRequestMutations;
  /** Archive an existing project. Only project owners can archive. */
  archive: Project;
  automationMutations: ProjectAutomationMutations;
  /** Batch delete projects */
  batchDelete: Scalars['Boolean']['output'];
  /** Create new project */
  create: Project;
  /** @deprecated Part of the old API surface and will be removed in the future. Field will be deleted on October 1st, 2026. */
  createEmbedToken: CreateEmbedTokenReturn;
  /** Delete an existing project */
  delete: Scalars['Boolean']['output'];
  /** Invite related mutations */
  invites: ProjectInviteMutations;
  issues: ProjectIssueMutations;
  /** Leave a project. Only possible if you're not the last remaining owner. */
  leave: Scalars['Boolean']['output'];
  modelIngestionMutations: ProjectModelIngestionMutations;
  /** @deprecated Part of the old API surface and will be removed in the future. Field will be deleted on October 1st, 2026. */
  revokeEmbedToken: Scalars['Boolean']['output'];
  /** @deprecated Part of the old API surface and will be removed in the future. Field will be deleted on October 1st, 2026. */
  revokeEmbedTokens: Scalars['Boolean']['output'];
  savedViewMutations: SavedViewMutations;
  /** Unarchive an archived project. Only project owners can unarchive. */
  unarchive: Project;
  /** Updates an existing project */
  update: Project;
  updateLabels: Project;
  /** Update role for a collaborator */
  updateRole: Project;
};


export type ProjectMutationsarchiveArgs = {
  id: Scalars['String']['input'];
};


export type ProjectMutationsautomationMutationsArgs = {
  projectId: Scalars['ID']['input'];
};


export type ProjectMutationsbatchDeleteArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type ProjectMutationscreateArgs = {
  input?: InputMaybe<ProjectCreateInput>;
};


export type ProjectMutationscreateEmbedTokenArgs = {
  token: EmbedTokenCreateInput;
};


export type ProjectMutationsdeleteArgs = {
  id: Scalars['String']['input'];
};


export type ProjectMutationsleaveArgs = {
  id: Scalars['String']['input'];
};


export type ProjectMutationsrevokeEmbedTokenArgs = {
  projectId: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type ProjectMutationsrevokeEmbedTokensArgs = {
  projectId: Scalars['String']['input'];
};


export type ProjectMutationsunarchiveArgs = {
  id: Scalars['String']['input'];
};


export type ProjectMutationsupdateArgs = {
  update: ProjectUpdateInput;
};


export type ProjectMutationsupdateLabelsArgs = {
  input: UpdateProjectLabelsInput;
};


export type ProjectMutationsupdateRoleArgs = {
  input: ProjectUpdateRoleInput;
};

export type ProjectPendingModelsUpdatedMessage = {
  __typename?: 'ProjectPendingModelsUpdatedMessage';
  /** Upload ID */
  id: Scalars['String']['output'];
  model: FileUpload;
  type: ProjectPendingModelsUpdatedMessageType;
};

export enum ProjectPendingModelsUpdatedMessageType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED'
}

export type ProjectPendingVersionsUpdatedMessage = {
  __typename?: 'ProjectPendingVersionsUpdatedMessage';
  /** Upload ID */
  id: Scalars['String']['output'];
  type: ProjectPendingVersionsUpdatedMessageType;
  version: FileUpload;
};

export enum ProjectPendingVersionsUpdatedMessageType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED'
}

export type ProjectPermissionChecks = {
  __typename?: 'ProjectPermissionChecks';
  canAccessIssuesFeature: PermissionCheckResult;
  canAccessViewerTableFeature: PermissionCheckResult;
  canArchive: PermissionCheckResult;
  canBroadcastActivity: PermissionCheckResult;
  canCreateAutomation: PermissionCheckResult;
  /** @deprecated Comments were moved to issues. Use canCreateIssue instead. This check will be removed after 01 Jun 2026. */
  canCreateComment: PermissionCheckResult;
  canCreateDashboards: PermissionCheckResult;
  canCreateEmbedTokens: PermissionCheckResult;
  canCreateIngestion: PermissionCheckResult;
  canCreateIssue: PermissionCheckResult;
  canCreateModel: PermissionCheckResult;
  canCreateResourceMeta: PermissionCheckResult;
  canCreateSavedView: PermissionCheckResult;
  canDelete: PermissionCheckResult;
  canDeleteResourceMeta: PermissionCheckResult;
  canInvite: PermissionCheckResult;
  canLeave: PermissionCheckResult;
  canListAutomations: PermissionCheckResult;
  canListIssues: PermissionCheckResult;
  canListShareTokens: PermissionCheckResult;
  canListUsers: PermissionCheckResult;
  canLoad: PermissionCheckResult;
  canMoveToWorkspace: PermissionCheckResult;
  canPublish: PermissionCheckResult;
  canRead: PermissionCheckResult;
  canReadAccIntegrationSettings: PermissionCheckResult;
  /** @deprecated Part of the old API surface and will be removed in the future. Use canListShareTokens. Field will be deleted on October 1st, 2026. */
  canReadEmbedTokens: PermissionCheckResult;
  canReadSettings: PermissionCheckResult;
  canReadWebhooks: PermissionCheckResult;
  canRequestRender: PermissionCheckResult;
  canRevokeAllShareTokens: PermissionCheckResult;
  /** @deprecated Part of the old API surface and will be removed in the future. Use canRevoke on ShareToken. Field will be deleted on October 1st, 2026. */
  canRevokeEmbedTokens: PermissionCheckResult;
  canUnarchive: PermissionCheckResult;
  canUpdate: PermissionCheckResult;
  canUpdateAllowPublicComments: PermissionCheckResult;
  canUpdateResourceMeta: PermissionCheckResult;
  canUpdateRole: PermissionCheckResult;
  canUseInvite: PermissionCheckResult;
};


export type ProjectPermissionCheckscanMoveToWorkspaceArgs = {
  workspaceId?: InputMaybe<Scalars['String']['input']>;
};


export type ProjectPermissionCheckscanUpdateRoleArgs = {
  targetRole?: InputMaybe<StreamRole>;
  targetUserId?: InputMaybe<Scalars['String']['input']>;
};


export type ProjectPermissionCheckscanUseInviteArgs = {
  type?: InputMaybe<InviteUseType>;
};

export type ProjectRole = {
  __typename?: 'ProjectRole';
  project: Project;
  role: Scalars['String']['output'];
};

export type ProjectSavedViewGroupsUpdatedMessage = {
  __typename?: 'ProjectSavedViewGroupsUpdatedMessage';
  /** SavedViewGroup ID */
  id: Scalars['ID']['output'];
  /** The project that the update belongs to */
  project: Project;
  /** Null if group was deleted */
  savedViewGroup: Maybe<SavedViewGroup>;
  type: ProjectSavedViewsUpdatedMessageType;
};

export type ProjectSavedViewsInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Optionally filter by visibility. */
  onlyVisibility?: InputMaybe<SavedViewVisibility>;
  /**
   * Viewer resource ID string that identifies which resources should be loaded. If not specified,
   * views from all resources in the project will be returned.
   */
  resourceIdString?: InputMaybe<Scalars['String']['input']>;
  /** Whether to only include views matching this search term */
  search?: InputMaybe<Scalars['String']['input']>;
  /**
   * Optionally specify sort by field. Default: position
   * Options: updatedAt, createdAt, name, position
   */
  sortBy?: InputMaybe<Scalars['String']['input']>;
  /** Optionally specify sort direction. Default: descending */
  sortDirection?: InputMaybe<SortDirection>;
};

export type ProjectSavedViewsUpdatedMessage = {
  __typename?: 'ProjectSavedViewsUpdatedMessage';
  /** Set if view was deleted/updated, allows some limited access into the view before the change (update/delete) */
  beforeChangeSavedView: Maybe<BeforeChangeSavedView>;
  /** SavedView ID */
  id: Scalars['ID']['output'];
  /** The project that the update belongs to */
  project: Project;
  /** Null if view was deleted */
  savedView: Maybe<SavedView>;
  type: ProjectSavedViewsUpdatedMessageType;
};

export enum ProjectSavedViewsUpdatedMessageType {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  UPDATED = 'UPDATED'
}

export type ProjectShareTokensFilter = {
  createdByUserId?: InputMaybe<Scalars['String']['input']>;
  sourceType?: InputMaybe<ShareSourceType>;
};

export type ProjectSyncsUpdatedMessage = {
  __typename?: 'ProjectSyncsUpdatedMessage';
  id: Scalars['String']['output'];
  sync: Maybe<Sync>;
  type: ProjectSyncsUpdatedMessageType;
};

export enum ProjectSyncsUpdatedMessageType {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  UPDATED = 'UPDATED'
}

export type ProjectTestAutomationCreateInput = {
  modelId: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type ProjectTriggeredAutomationsStatusUpdatedMessage = {
  __typename?: 'ProjectTriggeredAutomationsStatusUpdatedMessage';
  model: Model;
  project: Project;
  run: AutomateRun;
  type: ProjectTriggeredAutomationsStatusUpdatedMessageType;
  version: Version;
};

export enum ProjectTriggeredAutomationsStatusUpdatedMessageType {
  RUN_CREATED = 'RUN_CREATED',
  RUN_UPDATED = 'RUN_UPDATED'
}

/** Any values left null will be ignored, so only set the properties that you want updated */
export type ProjectUpdateInput = {
  allowPublicComments?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  issuePrefix?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<ProjectVisibility>;
};

export type ProjectUpdateRoleInput = {
  projectId: Scalars['String']['input'];
  /** Leave role as null to revoke access entirely */
  role?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};

export type ProjectUpdatedMessage = {
  __typename?: 'ProjectUpdatedMessage';
  /** Project ID */
  id: Scalars['String']['output'];
  /** Project entity, null if project was deleted */
  project: Maybe<Project>;
  /** Message type */
  type: ProjectUpdatedMessageType;
};

export enum ProjectUpdatedMessageType {
  DELETED = 'DELETED',
  UPDATED = 'UPDATED'
}

export type ProjectVersionsPreviewGeneratedMessage = {
  __typename?: 'ProjectVersionsPreviewGeneratedMessage';
  objectId: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  versionId: Scalars['String']['output'];
};

export type ProjectVersionsUpdatedMessage = {
  __typename?: 'ProjectVersionsUpdatedMessage';
  /** Version ID */
  id: Scalars['String']['output'];
  /** Version's model ID */
  modelId: Scalars['String']['output'];
  type: ProjectVersionsUpdatedMessageType;
  /** Null if version was deleted */
  version: Maybe<Version>;
};

export enum ProjectVersionsUpdatedMessageType {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  UPDATED = 'UPDATED'
}

export enum ProjectVisibility {
  /** Only accessible to explicit collaborators */
  PRIVATE = 'PRIVATE',
  /** Accessible to everyone (even non-logged in users) */
  PUBLIC = 'PUBLIC',
  /** Legacy - same as public */
  UNLISTED = 'UNLISTED',
  /** Accessible to everyone in the project's workspace */
  WORKSPACE = 'WORKSPACE'
}

export type ProjectWiseFile = {
  __typename?: 'ProjectWiseFile';
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastModifiedByDisplayName: Maybe<Scalars['String']['output']>;
  lastModifiedDateTime: Maybe<Scalars['String']['output']>;
  path: Maybe<Scalars['String']['output']>;
  size: Maybe<Scalars['Int']['output']>;
};

export type ProjectWiseFileCollection = {
  __typename?: 'ProjectWiseFileCollection';
  items: Array<ProjectWiseFile>;
};

export type ProjectWiseFolder = {
  __typename?: 'ProjectWiseFolder';
  /** Sub-folders within this folder */
  children: ProjectWiseFolderCollection;
  displayName: Scalars['String']['output'];
  /** Files within this folder */
  files: ProjectWiseFileCollection;
  id: Scalars['ID']['output'];
  path: Maybe<Scalars['String']['output']>;
};

export type ProjectWiseFolderCollection = {
  __typename?: 'ProjectWiseFolderCollection';
  items: Array<ProjectWiseFolder>;
};

export type ProjectWiseIntegration = {
  __typename?: 'ProjectWiseIntegration';
  folder: ProjectWiseFolder;
  iTwin: ProjectWiseiTwin;
  iTwins: ProjectWiseiTwinCollection;
  /**
   * Resolve a ProjectWise Design Integration folder by id, scoped to a specific
   * Work Area Connection (via its `url`).
   */
  pwdiFolder: ProjectWisePwdiFolder;
};


export type ProjectWiseIntegrationfolderArgs = {
  folderId: Scalars['String']['input'];
};


export type ProjectWiseIntegrationiTwinArgs = {
  id: Scalars['String']['input'];
};


export type ProjectWiseIntegrationpwdiFolderArgs = {
  connectionUrl: Scalars['String']['input'];
  folderId: Scalars['String']['input'];
};

export type ProjectWiseItemCollection = {
  __typename?: 'ProjectWiseItemCollection';
  items: Array<ProjectWiseStorageItem>;
};

export type ProjectWisePwdiFile = {
  __typename?: 'ProjectWisePwdiFile';
  connectionUrl: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  fileName: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastModifiedByDisplayName: Maybe<Scalars['String']['output']>;
  lastModifiedDateTime: Maybe<Scalars['String']['output']>;
  size: Maybe<Scalars['Int']['output']>;
};

export type ProjectWisePwdiFileCollection = {
  __typename?: 'ProjectWisePwdiFileCollection';
  items: Array<ProjectWisePwdiFile>;
};

/**
 * A folder inside a ProjectWise Design Integration work area (browsed via WSG).
 * Mirrors `ProjectWiseFolder` but keyed to a specific Work Area Connection url.
 */
export type ProjectWisePwdiFolder = {
  __typename?: 'ProjectWisePwdiFolder';
  children: ProjectWisePwdiFolderCollection;
  connectionUrl: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  files: ProjectWisePwdiFileCollection;
  id: Scalars['ID']['output'];
};

export type ProjectWisePwdiFolderCollection = {
  __typename?: 'ProjectWisePwdiFolderCollection';
  items: Array<ProjectWisePwdiFolder>;
};

/** Mixed collection of folders and files (used for top-level iTwin contents) */
export type ProjectWiseStorageItem = {
  __typename?: 'ProjectWiseStorageItem';
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastModifiedDateTime: Maybe<Scalars['String']['output']>;
  path: Maybe<Scalars['String']['output']>;
  size: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
};

export type ProjectWiseWorkAreaConnection = {
  __typename?: 'ProjectWiseWorkAreaConnection';
  description: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /**
   * Root folder for a Pwdi connection. Null for Documents connections (use the
   * iTwin's `items` field for Documents browsing).
   */
  rootFolder: Maybe<ProjectWisePwdiFolder>;
  type: ProjectWiseWorkAreaConnectionType;
  /**
   * Backend URL for this connection. For Pwdi, this is the WSG endpoint used to
   * browse folders/files within the work area.
   */
  url: Scalars['String']['output'];
  workAreaName: Maybe<Scalars['String']['output']>;
};

export type ProjectWiseWorkAreaConnectionCollection = {
  __typename?: 'ProjectWiseWorkAreaConnectionCollection';
  items: Array<ProjectWiseWorkAreaConnection>;
};

/**
 * The backing storage for a Work Area Connection.
 * - Documents: iTwin Storage (the "Share" panel)
 * - Pwdi: ProjectWise Design Integration work area (the "ProjectWise Web" panel)
 */
export enum ProjectWiseWorkAreaConnectionType {
  Documents = 'Documents',
  Pwdi = 'Pwdi'
}

export type ProjectWiseiTwin = {
  __typename?: 'ProjectWiseiTwin';
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Top-level folders and files for this iTwin project (iTwin Storage / "Share") */
  items: ProjectWiseItemCollection;
  number: Maybe<Scalars['String']['output']>;
  status: Maybe<Scalars['String']['output']>;
  /**
   * ProjectWise Work Area Connections linked to this iTwin. Each connection exposes
   * either iTwin Storage ("Documents" type, same backing store as `items`) or a
   * ProjectWise Design Integration work area ("Pwdi" type, browsed via WSG).
   */
  workAreaConnections: ProjectWiseWorkAreaConnectionCollection;
};

export type ProjectWiseiTwinCollection = {
  __typename?: 'ProjectWiseiTwinCollection';
  items: Array<ProjectWiseiTwin>;
};

export type PropagationResult = {
  __typename?: 'PropagationResult';
  failed: Scalars['Int']['output'];
  skipped: Scalars['Int']['output'];
  updated: Scalars['Int']['output'];
};

export type PublicShareTokenInfo = {
  __typename?: 'PublicShareTokenInfo';
  hasPassword: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  sourceId: Scalars['String']['output'];
  sourceType: ShareSourceType;
};

export type Query = {
  __typename?: 'Query';
  /** Stare into the void. */
  _: Maybe<Scalars['String']['output']>;
  /** Gets the profile of the authenticated user or null if not authenticated */
  activeUser: Maybe<User>;
  admin: AdminQueries;
  /**
   * All the streams of the server. Available to admins only.
   * @deprecated use admin.projectList instead
   */
  adminStreams: Maybe<StreamCollection>;
  /**
   * Get all (or search for specific) users, registered or invited, from the server in a paginated view.
   * The query looks for matches in name, company and email.
   * @deprecated use admin.UserList instead
   */
  adminUsers: Maybe<AdminUsersListCollection>;
  /** Gets a specific app from the server. */
  app: Maybe<ServerApp>;
  /**
   * Returns all the publicly available apps on this server.
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  apps: Maybe<Array<Maybe<ServerAppListItem>>>;
  /** If user is authenticated using an app token, this will describe the app */
  authenticatedAsApp: Maybe<ServerAppListItem>;
  /** Get a single automate function by id. Error will be thrown if function is not found or inaccessible. */
  automateFunction: AutomateFunction;
  /** Part of the automation/function creation handshake mechanism */
  automateValidateAuthCode: Scalars['Boolean']['output'];
  dashboard: Dashboard;
  /**
   * All of the discoverable streams of the server
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  discoverableStreams: Maybe<StreamCollection>;
  /** Get a single insight by ID */
  insight: Maybe<Insight>;
  /** Get a single insight result by ID */
  insightResult: Maybe<InsightResult>;
  /** Get a single insight template by ID */
  insightTemplate: Maybe<InsightTemplate>;
  /** List all insights tracking a specific model */
  modelInsights: Array<Insight>;
  /** Get the (limited) profile information of another server user */
  otherUser: Maybe<LimitedUser>;
  permissions: RootPermissionChecks;
  /**
   * Find a specific project. Will throw an authorization error if active user isn't authorized
   * to see it, for example, if a project isn't public and the user doesn't have the appropriate rights.
   */
  project: Project;
  /** List all insights for a project, optionally filtered by type */
  projectInsights: Array<Insight>;
  /**
   * Look for an invitation to a project, for the current user (authed or not). If token
   * isn't specified, the server will look for any valid invite.
   */
  projectInvite: Maybe<PendingStreamCollaborator>;
  resourceMeta: ResourceMeta;
  resourceMetaSearch: Array<ResourceMeta>;
  serverInfo: ServerInfo;
  /** Receive metadata about an invite by the invite token */
  serverInviteByToken: Maybe<ServerInvite>;
  /** @deprecated use admin.serverStatistics instead */
  serverStats: ServerStats;
  /**
   * Auth-less preflight: check if a share token exists and whether it requires a password.
   * Returns null for unknown, revoked, or expired tokens — a non-null response means the token is valid.
   * No authentication required.
   */
  shareTokenInfo: Maybe<PublicShareTokenInfo>;
  /**
   * Returns a specific stream. Will throw an authorization error if active user isn't authorized
   * to see it, for example, if a stream isn't public and the user doesn't have the appropriate rights.
   * @deprecated Part of the old API surface and will be removed in the future. Use Query.project instead.
   */
  stream: Maybe<Stream>;
  /**
   * Get authed user's stream access request
   * @deprecated Part of the old API surface and will be removed in the future. Use User.projectAccessRequest instead.
   */
  streamAccessRequest: Maybe<StreamAccessRequest>;
  /**
   * Look for an invitation to a stream, for the current user (authed or not). If token
   * isn't specified, the server will look for any valid invite.
   * @deprecated Part of the old API surface and will be removed in the future. Use Query.projectInvite instead.
   */
  streamInvite: Maybe<PendingStreamCollaborator>;
  /**
   * Returns all streams that the active user is a collaborator on.
   * Pass in the `query` parameter to search by name, description or ID.
   * @deprecated Part of the old API surface and will be removed in the future. Use User.projects instead.
   */
  streams: Maybe<UserStreamCollection>;
  /**
   * Gets the profile of a user. If no id argument is provided, will return the current authenticated user's profile (as extracted from the authorization header).
   * @deprecated To be removed in the near future! Use 'activeUser' to get info about the active user or 'otherUser' to get info about another user.
   */
  user: Maybe<User>;
  /**
   * Validate password strength
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  userPwdStrength: PasswordStrengthCheckResults;
  /**
   * Search for users and return limited metadata about them, if you have the server:user role.
   * The query looks for matches in name & email
   * @deprecated Use users() instead.
   */
  userSearch: UserSearchResultCollection;
  /** Look up server users */
  users: UserSearchResultCollection;
  /** Look up server users with a collection of emails */
  usersByEmail: Array<Maybe<LimitedUser>>;
  /** Validates the slug, to make sure it contains only valid characters and its not taken. */
  validateWorkspaceSlug: Scalars['Boolean']['output'];
  workspace: Workspace;
  workspaceBySlug: Workspace;
  /** List templates for a workspace, optionally filtered by type */
  workspaceInsightTemplates: Array<InsightTemplate>;
  /**
   * Look for an invitation to a workspace, for the current user (authed or not).
   *
   * If token is specified, it will return the corresponding invite even if it belongs to a different user.
   *
   * Either token or workspaceId must be specified, or both
   */
  workspaceInvite: Maybe<PendingWorkspaceCollaborator>;
  /** Find workspaces a given user email can use SSO to sign with */
  workspaceSsoByEmail: Array<LimitedWorkspace>;
};


export type QueryadminStreamsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
};


export type QueryadminUsersArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  query?: InputMaybe<Scalars['String']['input']>;
};


export type QueryappArgs = {
  id: Scalars['String']['input'];
};


export type QueryautomateFunctionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryautomateValidateAuthCodeArgs = {
  payload: AutomateAuthCodePayloadTest;
  resources?: InputMaybe<AutomateAuthCodeResources>;
};


export type QuerydashboardArgs = {
  id: Scalars['String']['input'];
};


export type QuerydiscoverableStreamsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  sort?: InputMaybe<DiscoverableStreamsSortingInput>;
};


export type QueryinsightArgs = {
  id: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type QueryinsightResultArgs = {
  id: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type QueryinsightTemplateArgs = {
  id: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type QuerymodelInsightsArgs = {
  modelId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type QueryotherUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryprojectArgs = {
  id: Scalars['String']['input'];
};


export type QueryprojectInsightsArgs = {
  projectId: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryprojectInviteArgs = {
  projectId: Scalars['String']['input'];
  token?: InputMaybe<Scalars['String']['input']>;
};


export type QueryresourceMetaArgs = {
  id: Scalars['ID']['input'];
  projectId?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};


export type QueryresourceMetaSearchArgs = {
  metaType?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  resourceId: Scalars['String']['input'];
  resourceType: ResourceMetaType;
  workspaceId: Scalars['String']['input'];
};


export type QueryserverInviteByTokenArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};


export type QueryshareTokenInfoArgs = {
  token: Scalars['String']['input'];
};


export type QuerystreamArgs = {
  id: Scalars['String']['input'];
};


export type QuerystreamAccessRequestArgs = {
  streamId: Scalars['String']['input'];
};


export type QuerystreamInviteArgs = {
  streamId: Scalars['String']['input'];
  token?: InputMaybe<Scalars['String']['input']>;
};


export type QuerystreamsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};


export type QueryuserArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryuserPwdStrengthArgs = {
  pwd: Scalars['String']['input'];
};


export type QueryuserSearchArgs = {
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
  emailOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  query: Scalars['String']['input'];
};


export type QueryusersArgs = {
  input: UsersRetrievalInput;
};


export type QueryusersByEmailArgs = {
  input: BulkUsersRetrievalInput;
};


export type QueryvalidateWorkspaceSlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryworkspaceArgs = {
  id: Scalars['String']['input'];
};


export type QueryworkspaceBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryworkspaceInsightTemplatesArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};


export type QueryworkspaceInviteArgs = {
  options?: InputMaybe<WorkspaceInviteLookupOptions>;
  token?: InputMaybe<Scalars['String']['input']>;
  workspaceId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryworkspaceSsoByEmailArgs = {
  email: Scalars['String']['input'];
};

export type RemoveWorkspaceDomainInput = {
  domainId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type RequestWorkspaceSupportAccessInput = {
  /** Optional expiry timestamp. Null means no expiration. */
  validUntil?: InputMaybe<Scalars['DateTime']['input']>;
  workspaceId: Scalars['ID']['input'];
};

export type ResourceAccessRule = {
  __typename?: 'ResourceAccessRule';
  modelId: Maybe<Scalars['String']['output']>;
  projectId: Maybe<Scalars['String']['output']>;
  type: ResourceAccessRuleType;
  versionId: Maybe<Scalars['String']['output']>;
  workspaceId: Maybe<Scalars['String']['output']>;
};

export enum ResourceAccessRuleType {
  model = 'model',
  project = 'project',
  version = 'version',
  workspace = 'workspace'
}

export type ResourceIdentifier = {
  __typename?: 'ResourceIdentifier';
  resourceId: Scalars['String']['output'];
  resourceType: ResourceType;
};

export type ResourceMeta = {
  __typename?: 'ResourceMeta';
  authorId: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  data: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  metaType: Scalars['String']['output'];
  projectId: Maybe<Scalars['String']['output']>;
  resourceId: Scalars['String']['output'];
  resourceType: ResourceMetaType;
  updatedAt: Scalars['DateTime']['output'];
  workspaceId: Scalars['String']['output'];
};

export type ResourceMetaMutations = {
  __typename?: 'ResourceMetaMutations';
  create: ResourceMeta;
  delete: Scalars['Boolean']['output'];
  update: ResourceMeta;
};


export type ResourceMetaMutationscreateArgs = {
  input: CreateResourceMetaInput;
};


export type ResourceMetaMutationsdeleteArgs = {
  input: DeleteResourceMetaInput;
};


export type ResourceMetaMutationsupdateArgs = {
  input: UpdateResourceMetaInput;
};

export enum ResourceMetaType {
  issue = 'issue',
  model = 'model',
  object = 'object',
  project = 'project',
  version = 'version',
  widget = 'widget',
  workspace = 'workspace'
}

export enum ResourceType {
  comment = 'comment',
  commit = 'commit',
  object = 'object',
  stream = 'stream'
}

export type RevokeWorkspaceSupportAccessInput = {
  sessionId: Scalars['ID']['input'];
};

export type Role = {
  __typename?: 'Role';
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
  resourceTarget: Scalars['String']['output'];
};

export type RootPermissionChecks = {
  __typename?: 'RootPermissionChecks';
  canAccessServerAdminPanel: PermissionCheckResult;
  canCreatePersonalProject: PermissionCheckResult;
  canCreateWorkspace: PermissionCheckResult;
  canManageServerRegions: PermissionCheckResult;
  canManageServerUsers: PermissionCheckResult;
  canManageServerWorkspaces: PermissionCheckResult;
  canSupportServerUsers: PermissionCheckResult;
  canUpdateServerSettings: PermissionCheckResult;
  canUsePowerTools: PermissionCheckResult;
};

export type SavedView = {
  __typename?: 'SavedView';
  author: Maybe<LimitedUser>;
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  /** Always available because even ungrouped views show up in a fake "Ungrouped" group */
  group: SavedViewGroup;
  /** Empty ID means default/ungrouped view */
  groupId: Maybe<Scalars['ID']['output']>;
  /**
   * Truncated resourceIds w/o specific version data that is used to associate the view w/
   * specific groups
   */
  groupResourceIds: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isHomeView: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  permissions: SavedViewPermissionChecks;
  /** For figuring out position in the group */
  position: Scalars['Float']['output'];
  previewUrl: Scalars['String']['output'];
  projectId: Scalars['ID']['output'];
  /** Original resource ID string that this view is associated with. */
  resourceIdString: Scalars['String']['output'];
  /** Same as resourceIdString, but split into an array of resource IDs. */
  resourceIds: Array<Scalars['String']['output']>;
  thumbnailUrl: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  /** Viewer state, the actual view configuration */
  viewerState: Scalars['JSONObject']['output'];
  visibility: SavedViewVisibility;
};

export type SavedViewCollection = {
  __typename?: 'SavedViewCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<SavedView>;
  totalCount: Scalars['Int']['output'];
};

export type SavedViewGroup = {
  __typename?: 'SavedViewGroup';
  author: Maybe<LimitedUser>;
  /** Only set if this is a real/persisted group. */
  groupId: Maybe<Scalars['ID']['output']>;
  /** This is always set even for fake/not persisted groups for Apollo caching */
  id: Scalars['ID']['output'];
  isUngroupedViewsGroup: Scalars['Boolean']['output'];
  permissions: SavedViewGroupPermissionChecks;
  projectId: Scalars['ID']['output'];
  /** Resources that were used to find this group */
  resourceIds: Array<Scalars['String']['output']>;
  /** @deprecated Use Project.shareTokens with sourceType: savedViewGroup. Field will be deleted on November 1st, 2026. */
  shareLink: Maybe<SavedViewGroupShareLink>;
  title: Scalars['String']['output'];
  views: SavedViewCollection;
};


export type SavedViewGroupviewsArgs = {
  input: SavedViewGroupViewsInput;
};

export type SavedViewGroupCollection = {
  __typename?: 'SavedViewGroupCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<SavedViewGroup>;
  totalCount: Scalars['Int']['output'];
};

export type SavedViewGroupPermissionChecks = {
  __typename?: 'SavedViewGroupPermissionChecks';
  canCreateToken: PermissionCheckResult;
  canUpdate: PermissionCheckResult;
};

export type SavedViewGroupShareInput = {
  groupId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};

export type SavedViewGroupShareLink = {
  __typename?: 'SavedViewGroupShareLink';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  revoked: Scalars['Boolean']['output'];
  validUntil: Scalars['DateTime']['output'];
};

export type SavedViewGroupShareUpdateInput = {
  groupId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
  shareId: Scalars['ID']['input'];
};

export type SavedViewGroupViewsInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Whether to only views authored by the current user */
  onlyAuthored?: InputMaybe<Scalars['Boolean']['input']>;
  /** Optionally filter by visibility. Setting this to 'authorOnly' is the equivalent of setting 'onlyAuthored' to true. */
  onlyVisibility?: InputMaybe<SavedViewVisibility>;
  /** Whether to only include views matching this search term */
  search?: InputMaybe<Scalars['String']['input']>;
  /**
   * Optionally specify sort by field. Default: position
   * Options: updatedAt, createdAt, name, position
   */
  sortBy?: InputMaybe<Scalars['String']['input']>;
  /** Optionally specify sort direction. Default: descending */
  sortDirection?: InputMaybe<SortDirection>;
};

export type SavedViewGroupsInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Whether to only include groups w/ views authored by the current user */
  onlyAuthored?: InputMaybe<Scalars['Boolean']['input']>;
  /** Optionally filter by visibility. Setting this to 'authorOnly' is the equivalent of setting 'onlyAuthored' to true. */
  onlyVisibility?: InputMaybe<SavedViewVisibility>;
  /** Viewer resource ID string that identifies which resources should be loaded */
  resourceIdString: Scalars['String']['input'];
  /** Whether to only include groups that have names or views matching this search term */
  search?: InputMaybe<Scalars['String']['input']>;
};

export type SavedViewMutations = {
  __typename?: 'SavedViewMutations';
  createGroup: SavedViewGroup;
  createView: SavedView;
  deleteGroup: Scalars['Boolean']['output'];
  /** @deprecated Use sharingMutations.createPresentationShareToken / revokeShareToken. Field will be deleted on November 1st, 2026. */
  deleteShare: Scalars['Boolean']['output'];
  deleteView: Scalars['Boolean']['output'];
  /** @deprecated Use sharingMutations.createPresentationShareToken / revokeShareToken. Field will be deleted on November 1st, 2026. */
  disableShare: SavedViewGroupShareLink;
  /** @deprecated Use sharingMutations.createPresentationShareToken / revokeShareToken. Field will be deleted on November 1st, 2026. */
  enableShare: SavedViewGroupShareLink;
  /** @deprecated Use sharingMutations.createPresentationShareToken / revokeShareToken. Field will be deleted on November 1st, 2026. */
  share: SavedViewGroupShareLink;
  updateGroup: SavedViewGroup;
  updateView: SavedView;
};


export type SavedViewMutationscreateGroupArgs = {
  input: CreateSavedViewGroupInput;
};


export type SavedViewMutationscreateViewArgs = {
  input: CreateSavedViewInput;
};


export type SavedViewMutationsdeleteGroupArgs = {
  input: DeleteSavedViewGroupInput;
};


export type SavedViewMutationsdeleteShareArgs = {
  input: SavedViewGroupShareUpdateInput;
};


export type SavedViewMutationsdeleteViewArgs = {
  input: DeleteSavedViewInput;
};


export type SavedViewMutationsdisableShareArgs = {
  input: SavedViewGroupShareUpdateInput;
};


export type SavedViewMutationsenableShareArgs = {
  input: SavedViewGroupShareUpdateInput;
};


export type SavedViewMutationsshareArgs = {
  input: SavedViewGroupShareInput;
};


export type SavedViewMutationsupdateGroupArgs = {
  input: UpdateSavedViewGroupInput;
};


export type SavedViewMutationsupdateViewArgs = {
  input: UpdateSavedViewInput;
};

export type SavedViewPermissionChecks = {
  __typename?: 'SavedViewPermissionChecks';
  canChangeVisibility: PermissionCheckResult;
  canDelete: PermissionCheckResult;
  canEditDescription: PermissionCheckResult;
  canEditTitle: PermissionCheckResult;
  canMove: PermissionCheckResult;
  canReplaceView: PermissionCheckResult;
  canSetAsHomeView: PermissionCheckResult;
  /**
   * Can the current user fully update everything about this view. Even if this fails,
   * the user may be able to do partial updates (e.g. just change the title)
   */
  canUpdate: PermissionCheckResult;
};

export enum SavedViewVisibility {
  authorOnly = 'authorOnly',
  public = 'public'
}

export type SavedViewsLoadSettings = {
  /**
   * If true, load versions originally specified in the view, rather than the latest ones
   * or ones already being loaded otherwise
   */
  loadOriginal?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Available scopes. */
export type Scope = {
  __typename?: 'Scope';
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

/** The delivery status of a sent e-mail */
export enum SentEmailDeliveryStatus {
  /** The e-mail failed to send */
  FAILED = 'FAILED',
  /** The e-mail is being processed */
  PENDING = 'PENDING',
  /** The e-mail is queued for sending */
  QUEUED = 'QUEUED',
  /** The e-mail has been sent */
  SENT = 'SENT'
}

/** Information about a sent e-mail */
export type SentEmailInfo = {
  __typename?: 'SentEmailInfo';
  /** Any error messages encountered during sending (if any) */
  errorMessages: Maybe<Array<Scalars['String']['output']>>;
  /** The ID of the sent message (if available) */
  messageId: Scalars['String']['output'];
  /** The status of the delivery attempt */
  status: SentEmailDeliveryStatus;
};

export type ServerApp = {
  __typename?: 'ServerApp';
  author: Maybe<AppAuthor>;
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logo: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  public: Maybe<Scalars['Boolean']['output']>;
  redirectUrl: Scalars['String']['output'];
  scopes: Array<Scope>;
  secret: Maybe<Scalars['String']['output']>;
  termsAndConditionsLink: Maybe<Scalars['String']['output']>;
  trustByDefault: Maybe<Scalars['Boolean']['output']>;
};

export type ServerAppListItem = {
  __typename?: 'ServerAppListItem';
  author: Maybe<AppAuthor>;
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logo: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  redirectUrl: Scalars['String']['output'];
  termsAndConditionsLink: Maybe<Scalars['String']['output']>;
  trustByDefault: Maybe<Scalars['Boolean']['output']>;
};

export type ServerAutomateInfo = {
  __typename?: 'ServerAutomateInfo';
  availableFunctionTemplates: Array<AutomateFunctionTemplate>;
};

/** Server configuration. */
export type ServerConfiguration = {
  __typename?: 'ServerConfiguration';
  blobSizeLimitBytes: Scalars['Int']['output'];
  /** Origin URL of the dashboards service */
  dashboardsOrigin: Maybe<Scalars['String']['output']>;
  /** Email verification code timeout in minutes */
  emailVerificationTimeoutMinutes: Scalars['Int']['output'];
  /** Active server-level feature flags */
  featureFlags: Scalars['JSONObject']['output'];
  /** Whether the email feature is enabled on this server */
  isEmailEnabled: Scalars['Boolean']['output'];
  objectMultipartUploadSizeLimitBytes: Scalars['Int']['output'];
  objectSizeLimitBytes: Scalars['Int']['output'];
};

/** Information about this server. */
export type ServerInfo = {
  __typename?: 'ServerInfo';
  adminContact: Maybe<Scalars['String']['output']>;
  /** The authentication strategies available on this server. */
  authStrategies: Array<AuthStrategy>;
  automate: ServerAutomateInfo;
  /** Base URL of Speckle Automate, if set */
  automateUrl: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the ServerInfo{configuration{blobSizeLimitBytes}} field instead. */
  blobSizeLimitBytes: Scalars['Int']['output'];
  canonicalUrl: Maybe<Scalars['String']['output']>;
  company: Maybe<Scalars['String']['output']>;
  /**
   * Configuration values that are specific to this server.
   * These are read-only and can only be adjusted during server setup.
   * Please contact your server administrator if you wish to suggest a change to these values.
   */
  configuration: ServerConfiguration;
  description: Maybe<Scalars['String']['output']>;
  /** Whether or not to show messaging about FE2 (banners etc.) */
  enableNewWebUiMessaging: Maybe<Scalars['Boolean']['output']>;
  guestModeEnabled: Scalars['Boolean']['output'];
  inviteOnly: Maybe<Scalars['Boolean']['output']>;
  /** Server relocation / migration info */
  migration: Maybe<ServerMigration>;
  /** Info about server regions */
  multiRegion: ServerMultiRegionConfiguration;
  name: Scalars['String']['output'];
  /** @deprecated Use role constants from the @speckle/shared npm package instead */
  roles: Array<Role>;
  scopes: Array<Scope>;
  serverRoles: Array<ServerRoleItem>;
  termsOfService: Maybe<Scalars['String']['output']>;
  version: Maybe<Scalars['String']['output']>;
  workspaces: ServerWorkspacesInfo;
};

export type ServerInfoMutations = {
  __typename?: 'ServerInfoMutations';
  multiRegion: ServerRegionMutations;
};

export type ServerInfoUpdateInput = {
  adminContact?: InputMaybe<Scalars['String']['input']>;
  company?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  guestModeEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  inviteOnly?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  termsOfService?: InputMaybe<Scalars['String']['input']>;
};

export type ServerInvite = {
  __typename?: 'ServerInvite';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  invitedBy: LimitedUser;
};

export type ServerInviteCreateInput = {
  email: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  /** Can only be specified if guest mode is on or if the user is an admin */
  serverRole?: InputMaybe<Scalars['String']['input']>;
};

export type ServerMigration = {
  __typename?: 'ServerMigration';
  movedFrom: Maybe<Scalars['String']['output']>;
  movedTo: Maybe<Scalars['String']['output']>;
};

export type ServerMultiRegionConfiguration = {
  __typename?: 'ServerMultiRegionConfiguration';
  /**
   * Keys of available regions defined in the multi region config file. Used keys will
   * be filtered out from the result. Nullable because the field is only resolvable for
   * users that can manage server regions; for other users it returns null instead of
   * nulling the entire parent query.
   */
  availableKeys: Maybe<Array<Scalars['String']['output']>>;
  /** Regions available for project data residency */
  regions: Array<ServerRegionItem>;
};

export type ServerRegionItem = {
  __typename?: 'ServerRegionItem';
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type ServerRegionMutations = {
  __typename?: 'ServerRegionMutations';
  create: ServerRegionItem;
  update: ServerRegionItem;
};


export type ServerRegionMutationscreateArgs = {
  input: CreateServerRegionInput;
};


export type ServerRegionMutationsupdateArgs = {
  input: UpdateServerRegionInput;
};

export enum ServerRole {
  SERVER_ADMIN = 'SERVER_ADMIN',
  SERVER_ARCHIVED_USER = 'SERVER_ARCHIVED_USER',
  SERVER_GUEST = 'SERVER_GUEST',
  SERVER_SUPPORT = 'SERVER_SUPPORT',
  SERVER_USER = 'SERVER_USER'
}

export type ServerRoleItem = {
  __typename?: 'ServerRoleItem';
  id: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ServerStatistics = {
  __typename?: 'ServerStatistics';
  totalPendingInvites: Scalars['Int']['output'];
  totalProjectCount: Scalars['Int']['output'];
  totalUserCount: Scalars['Int']['output'];
};

export type ServerStats = {
  __typename?: 'ServerStats';
  /** An array of objects currently structured as { created_month: Date, count: int }. */
  commitHistory: Maybe<Array<Maybe<Scalars['JSONObject']['output']>>>;
  /** An array of objects currently structured as { created_month: Date, count: int }. */
  objectHistory: Maybe<Array<Maybe<Scalars['JSONObject']['output']>>>;
  /** An array of objects currently structured as { created_month: Date, count: int }. */
  streamHistory: Maybe<Array<Maybe<Scalars['JSONObject']['output']>>>;
  totalCommitCount: Scalars['Int']['output'];
  totalObjectCount: Scalars['Int']['output'];
  totalStreamCount: Scalars['Int']['output'];
  totalUserCount: Scalars['Int']['output'];
  /** An array of objects currently structured as { created_month: Date, count: int }. */
  userHistory: Maybe<Array<Maybe<Scalars['JSONObject']['output']>>>;
};

export type ServerWorkspacesInfo = {
  __typename?: 'ServerWorkspacesInfo';
  /** Up-to-date prices for paid & non-invoiced Workspace plans */
  planPrices: Maybe<CurrencyBasedPrices>;
  /**
   * This is a backend control variable for the workspaces feature set.
   * Since workspaces need a backend logic to be enabled, this is not enough as a feature flag.
   */
  workspacesEnabled: Scalars['Boolean']['output'];
};

export enum SessionPaymentStatus {
  paid = 'paid',
  unpaid = 'unpaid'
}

export type SetPrimaryUserEmailInput = {
  id: Scalars['ID']['input'];
};

export type SetSyncActiveInput = {
  active: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
  projectId: Scalars['String']['input'];
};

export enum ShareSourceType {
  dashboard = 'dashboard',
  embed = 'embed',
  savedViewGroup = 'savedViewGroup'
}

export type ShareToken = {
  __typename?: 'ShareToken';
  createdAt: Scalars['DateTime']['output'];
  createdBy: LimitedUser;
  expiresAt: Maybe<Scalars['DateTime']['output']>;
  hasPassword: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  label: Maybe<Scalars['String']['output']>;
  lastUsed: Maybe<Scalars['DateTime']['output']>;
  permissions: ShareTokenPermissionChecks;
  resourceAccessRules: Array<ResourceAccessRule>;
  sourceId: Scalars['String']['output'];
  sourceType: ShareSourceType;
  /** The full token string. Only returned on creation. */
  token: Maybe<Scalars['String']['output']>;
};

export type ShareTokenCollection = {
  __typename?: 'ShareTokenCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<ShareToken>;
  totalCount: Scalars['Int']['output'];
};

export type ShareTokenPermissionChecks = {
  __typename?: 'ShareTokenPermissionChecks';
  canRevoke: PermissionCheckResult;
  canUpdate: PermissionCheckResult;
};

export type SharingMutations = {
  __typename?: 'SharingMutations';
  createDashboardShareToken: ShareToken;
  createEmbedShareToken: ShareToken;
  createPresentationShareToken: ShareToken;
  revokeProjectShareTokens: Scalars['Boolean']['output'];
  revokeShareToken: Scalars['Boolean']['output'];
  updateShareToken: ShareToken;
};


export type SharingMutationscreateDashboardShareTokenArgs = {
  input: CreateDashboardShareTokenInput;
};


export type SharingMutationscreateEmbedShareTokenArgs = {
  input: CreateEmbedShareTokenInput;
};


export type SharingMutationscreatePresentationShareTokenArgs = {
  input: CreatePresentationShareTokenInput;
};


export type SharingMutationsrevokeProjectShareTokensArgs = {
  projectId: Scalars['String']['input'];
  sourceType?: InputMaybe<ShareSourceType>;
};


export type SharingMutationsrevokeShareTokenArgs = {
  tokenId: Scalars['String']['input'];
};


export type SharingMutationsupdateShareTokenArgs = {
  input: UpdateShareTokenInput;
  tokenId: Scalars['String']['input'];
};

export type SmartTextEditorValue = {
  __typename?: 'SmartTextEditorValue';
  /** File attachments, if any */
  attachments: Maybe<Array<BlobMetadata>>;
  /**
   * The actual (ProseMirror) document representing the text.
   * SANITIZATION NOTICE: None of the content inside this document is sanitized on input. Putting this into a TipTap editor
   * should do all sanitization, but if you plan to render the text any other way you should sanitize it first to avoid XSS attacks.
   */
  doc: Maybe<Scalars['JSONObject']['output']>;
  /** The type of editor value (comment, blog post etc.) */
  type: Scalars['String']['output'];
  /** The version of the schema */
  version: Scalars['String']['output'];
};

/** Use SortOrder instead, which has more consistent casing w/ server internals */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc'
}

export type SourceData = {
  __typename?: 'SourceData';
  fileName: Maybe<Scalars['String']['output']>;
  fileSizeBytes: Maybe<Scalars['BigInt']['output']>;
  sourceApplicationSlug: Maybe<Scalars['String']['output']>;
  sourceApplicationVersion: Maybe<Scalars['String']['output']>;
};

export type SourceDataInput = {
  fileName?: InputMaybe<Scalars['String']['input']>;
  fileSizeBytes?: InputMaybe<Scalars['BigInt']['input']>;
  sourceApplicationSlug: Scalars['String']['input'];
  sourceApplicationVersion: Scalars['String']['input'];
};

export type StartFileImportInput = {
  /**
   * The etag is returned by the blob storage provider in the response body after a successful upload.
   * It is used to verify the integrity of the uploaded file.
   */
  etag: Scalars['String']['input'];
  fileId: Scalars['String']['input'];
  modelId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};

export type Stream = {
  __typename?: 'Stream';
  allowPublicComments: Scalars['Boolean']['output'];
  /** @deprecated Part of the old API surface and will be removed in the future. Use Project.blob instead. */
  blob: Maybe<BlobMetadata>;
  /**
   * Get the metadata collection of blobs stored for this stream.
   * @deprecated Part of the old API surface and will be removed in the future. Use Project.blobs instead.
   */
  blobs: Maybe<BlobMetadataCollection>;
  /** @deprecated Part of the old API surface and will be removed in the future. Use Project.model or Project.modelByName instead. */
  branch: Maybe<Branch>;
  /** @deprecated Part of the old API surface and will be removed in the future. Use Project.models or Project.modelsTree instead. */
  branches: Maybe<BranchCollection>;
  collaborators: Array<StreamCollaborator>;
  /**
   * The total number of comments for this stream. To actually get the comments, use the comments query without passing in a resource array. E.g.:
   *
   * ```
   * query{
   *   comments(streamId:"streamId"){
   *     ...
   *   }
   * ```
   * @deprecated Part of the old API surface and will be removed in the future. Always returns 0.
   */
  commentCount: Scalars['Int']['output'];
  /** @deprecated Part of the old API surface and will be removed in the future. Use Project.version instead. */
  commit: Maybe<Commit>;
  /** @deprecated Part of the old API surface and will be removed in the future. Use Project.versions instead. */
  commits: Maybe<CommitCollection>;
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  /** Date when you favorited this stream. `null` if stream isn't viewed from a specific user's perspective or if it isn't favorited. */
  favoritedDate: Maybe<Scalars['DateTime']['output']>;
  favoritesCount: Scalars['Int']['output'];
  /**
   * Returns a specific file upload that belongs to this stream.
   * @deprecated Part of the old API surface and will be removed in the future. Use Project.pendingImportedModels or Model.pendingImportedVersions instead.
   */
  fileUpload: Maybe<FileUpload>;
  /**
   * Returns a list of all the file uploads for this stream.
   * @deprecated Part of the old API surface and will be removed in the future. Use Project.pendingImportedModels or Model.pendingImportedVersions instead.
   */
  fileUploads: Array<FileUpload>;
  id: Scalars['String']['output'];
  /**
   * Whether the stream (if public) can be found on public stream exploration pages
   * and searches
   * @deprecated Discoverability as a feature has been removed.
   */
  isDiscoverable: Scalars['Boolean']['output'];
  /** Whether the stream can be viewed by non-contributors */
  isPublic: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  /** @deprecated Part of the old API surface and will be removed in the future. Use Project.object instead. */
  object: Maybe<Object>;
  /**
   * Pending stream access requests
   * @deprecated Part of the old API surface and will be removed in the future. Use Project.pendingAccessRequests instead.
   */
  pendingAccessRequests: Maybe<Array<StreamAccessRequest>>;
  /** Collaborators who have been invited, but not yet accepted. */
  pendingCollaborators: Maybe<Array<PendingStreamCollaborator>>;
  /** Your role for this stream. `null` if request is not authenticated, or the stream is not explicitly shared with you. */
  role: Maybe<Scalars['String']['output']>;
  size: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  /** @deprecated Part of the old API surface and will be removed in the future. Use Project.webhooks instead. */
  webhooks: WebhookCollection;
};


export type StreamblobArgs = {
  id: Scalars['String']['input'];
};


export type StreamblobsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};


export type StreambranchArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type StreambranchesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type StreamcommitArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type StreamcommitsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type StreamfileUploadArgs = {
  id: Scalars['String']['input'];
};


export type StreamobjectArgs = {
  id: Scalars['String']['input'];
};


export type StreamwebhooksArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};

/** Created when a user requests to become a contributor on a stream */
export type StreamAccessRequest = {
  __typename?: 'StreamAccessRequest';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  requester: LimitedUser;
  requesterId: Scalars['String']['output'];
  /** Can only be selected if authed user has proper access */
  stream: Stream;
  streamId: Scalars['String']['output'];
};

export type StreamCollaborator = {
  __typename?: 'StreamCollaborator';
  avatar: Maybe<Scalars['String']['output']>;
  company: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  role: Scalars['String']['output'];
  serverRole: Scalars['String']['output'];
};

export type StreamCollection = {
  __typename?: 'StreamCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Maybe<Array<Stream>>;
  totalCount: Scalars['Int']['output'];
};

export type StreamCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  /**
   * Whether the stream (if public) can be found on public stream exploration pages
   * and searches
   */
  isDiscoverable?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the stream can be viewed by non-contributors */
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** Optionally specify user IDs of users that you want to invite to be contributors to this stream */
  withContributors?: InputMaybe<Array<Scalars['String']['input']>>;
};

export enum StreamRole {
  STREAM_CONTRIBUTOR = 'STREAM_CONTRIBUTOR',
  STREAM_OWNER = 'STREAM_OWNER',
  STREAM_REVIEWER = 'STREAM_REVIEWER'
}

export type StreamUpdateInput = {
  allowPublicComments?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  /**
   * Whether the stream (if public) can be found on public stream exploration pages
   * and searches
   */
  isDiscoverable?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the stream can be viewed by non-contributors */
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** It's lonely in the void. */
  _: Maybe<Scalars['String']['output']>;
  /**
   * Subscribe to branch created event
   * @deprecated Part of the old API surface and will be removed in the future. Use 'projectModelsUpdated' instead.
   */
  branchCreated: Maybe<Scalars['JSONObject']['output']>;
  /**
   * Subscribe to branch deleted event
   * @deprecated Part of the old API surface and will be removed in the future. Use 'projectModelsUpdated' instead.
   */
  branchDeleted: Maybe<Scalars['JSONObject']['output']>;
  /**
   * Subscribe to branch updated event.
   * @deprecated Part of the old API surface and will be removed in the future. Use 'projectModelsUpdated' instead.
   */
  branchUpdated: Maybe<Scalars['JSONObject']['output']>;
  /**
   * Subscribe to commit created event
   * @deprecated Part of the old API surface and will be removed in the future. Use 'projectVersionsUpdated' instead.
   */
  commitCreated: Maybe<Scalars['JSONObject']['output']>;
  /**
   * Subscribe to commit deleted event
   * @deprecated Part of the old API surface and will be removed in the future. Use 'projectVersionsUpdated' instead.
   */
  commitDeleted: Maybe<Scalars['JSONObject']['output']>;
  /**
   * Subscribe to commit updated event.
   * @deprecated Part of the old API surface and will be removed in the future. Use 'projectVersionsUpdated' instead.
   */
  commitUpdated: Maybe<Scalars['JSONObject']['output']>;
  /**
   * Cyclically sends a message to the client, used for testing
   * Note: Only works in test environment
   */
  ping: Scalars['String']['output'];
  /**
   * Subscribe to changes to a project's sync items. Optionally specify lineage urns to subscribe to.
   * @deprecated Use Subscription.projectSyncsUpdated instead. Covers every integration, not just ACC.
   */
  projectAccSyncItemsUpdated: ProjectAccSyncItemsUpdatedMessage;
  /** Subscribe to updates to automations in the project */
  projectAutomationsUpdated: ProjectAutomationsUpdatedMessage;
  /**
   * Subscribe to updates to resource comments/threads. Optionally specify resource ID string to only receive
   * updates regarding comments for those resources.
   * @deprecated Comments were moved to issues. Use projectIssuesUpdated instead. This subscription will be removed after 01 Jun 2026.
   */
  projectCommentsUpdated: ProjectCommentsUpdatedMessage;
  /**
   * Subscribe to changes to any of a project's file imports
   * @deprecated Part of the old API surface and will be removed in the future. Use projectPendingModelsUpdated or projectPendingVersionsUpdated instead.
   */
  projectFileImportUpdated: ProjectFileImportUpdatedMessage;
  /** Subscribe to changes to a project's issues */
  projectIssuesUpdated: ProjectIssuesUpdatedMessage;
  projectModelIngestionUpdated: ProjectModelIngestionUpdatedMessage;
  /** Subscribe to changes to a project's models. Optionally specify modelIds to track. */
  projectModelsUpdated: ProjectModelsUpdatedMessage;
  /** Subscribe to changes to a project's pending models */
  projectPendingModelsUpdated: ProjectPendingModelsUpdatedMessage;
  /** Subscribe to changes to a project's pending versions */
  projectPendingVersionsUpdated: ProjectPendingVersionsUpdatedMessage;
  /** Subscribe to changes to a project's saved view groups. */
  projectSavedViewGroupsUpdated: ProjectSavedViewGroupsUpdatedMessage;
  /** Subscribe to changes to a project's saved views. */
  projectSavedViewsUpdated: ProjectSavedViewsUpdatedMessage;
  /** Subscribe to changes to a project's syncs. */
  projectSyncsUpdated: ProjectSyncsUpdatedMessage;
  /** Subscribe to updates to any triggered automations statuses in the project */
  projectTriggeredAutomationsStatusUpdated: ProjectTriggeredAutomationsStatusUpdatedMessage;
  /** Track updates to a specific project */
  projectUpdated: ProjectUpdatedMessage;
  /** Subscribe to when a project's versions get their preview image fully generated. */
  projectVersionsPreviewGenerated: ProjectVersionsPreviewGeneratedMessage;
  /** Subscribe to changes to a project's versions. */
  projectVersionsUpdated: ProjectVersionsUpdatedMessage;
  /**
   * Subscribes to stream deleted event. Use this in clients/components that pertain only to this stream.
   * @deprecated Part of the old API surface and will be removed in the future. Use projectUpdated instead.
   */
  streamDeleted: Maybe<Scalars['JSONObject']['output']>;
  /**
   * Subscribes to stream updated event. Use this in clients/components that pertain only to this stream.
   * @deprecated Part of the old API surface and will be removed in the future. Use projectUpdated instead.
   */
  streamUpdated: Maybe<Scalars['JSONObject']['output']>;
  /** Track newly added or deleted projects owned by the active user */
  userProjectsUpdated: UserProjectsUpdatedMessage;
  /**
   * Subscribes to new stream added event for your profile. Use this to display an up-to-date list of streams.
   * **NOTE**: If someone shares a stream with you, this subscription will be triggered with an extra value of `sharedBy` in the payload.
   * @deprecated Part of the old API surface and will be removed in the future. Use userProjectsUpdated instead.
   */
  userStreamAdded: Maybe<Scalars['JSONObject']['output']>;
  /**
   * Subscribes to stream removed event for your profile. Use this to display an up-to-date list of streams for your profile.
   * **NOTE**: If someone revokes your permissions on a stream, this subscription will be triggered with an extra value of `revokedBy` in the payload.
   * @deprecated Part of the old API surface and will be removed in the future. Use userProjectsUpdated instead.
   */
  userStreamRemoved: Maybe<Scalars['JSONObject']['output']>;
  /** Track user activities in the viewer relating to the specified resources */
  viewerUserActivityBroadcasted: ViewerUserActivityMessage;
  /** Subscribe to changes on workspace usage */
  workspacePlanUsageUpdated: Scalars['Boolean']['output'];
  /**
   * Track newly added or deleted projects in a specific workspace.
   * Either slug or id must be set.
   */
  workspaceProjectsUpdated: WorkspaceProjectsUpdatedMessage;
  /**
   * Track support session changes for a specific workspace.
   * Fires when sessions are requested, approved, revoked, or expire.
   */
  workspaceSupportSessionUpdated: Maybe<WorkspaceSupportSessionUpdatedMessage>;
  /**
   * Track updates to a specific workspace.
   * Either slug or id must be set.
   */
  workspaceUpdated: WorkspaceUpdatedMessage;
};


export type SubscriptionbranchCreatedArgs = {
  streamId: Scalars['String']['input'];
};


export type SubscriptionbranchDeletedArgs = {
  streamId: Scalars['String']['input'];
};


export type SubscriptionbranchUpdatedArgs = {
  branchId?: InputMaybe<Scalars['String']['input']>;
  streamId: Scalars['String']['input'];
};


export type SubscriptioncommitCreatedArgs = {
  streamId: Scalars['String']['input'];
};


export type SubscriptioncommitDeletedArgs = {
  streamId: Scalars['String']['input'];
};


export type SubscriptioncommitUpdatedArgs = {
  commitId?: InputMaybe<Scalars['String']['input']>;
  streamId: Scalars['String']['input'];
};


export type SubscriptionprojectAccSyncItemsUpdatedArgs = {
  id: Scalars['String']['input'];
  itemIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type SubscriptionprojectAutomationsUpdatedArgs = {
  projectId: Scalars['String']['input'];
};


export type SubscriptionprojectCommentsUpdatedArgs = {
  target: ViewerUpdateTrackingTarget;
};


export type SubscriptionprojectFileImportUpdatedArgs = {
  id: Scalars['String']['input'];
};


export type SubscriptionprojectIssuesUpdatedArgs = {
  loadedVersionsOnly?: InputMaybe<Scalars['Boolean']['input']>;
  projectId: Scalars['ID']['input'];
  resourceIdString?: InputMaybe<Scalars['String']['input']>;
};


export type SubscriptionprojectModelIngestionUpdatedArgs = {
  input: ProjectModelIngestionSubscriptionInput;
};


export type SubscriptionprojectModelsUpdatedArgs = {
  id: Scalars['String']['input'];
  modelIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type SubscriptionprojectPendingModelsUpdatedArgs = {
  id: Scalars['String']['input'];
};


export type SubscriptionprojectPendingVersionsUpdatedArgs = {
  id: Scalars['String']['input'];
};


export type SubscriptionprojectSavedViewGroupsUpdatedArgs = {
  projectId: Scalars['ID']['input'];
};


export type SubscriptionprojectSavedViewsUpdatedArgs = {
  projectId: Scalars['ID']['input'];
};


export type SubscriptionprojectSyncsUpdatedArgs = {
  id: Scalars['String']['input'];
  itemIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type SubscriptionprojectTriggeredAutomationsStatusUpdatedArgs = {
  projectId: Scalars['String']['input'];
};


export type SubscriptionprojectUpdatedArgs = {
  id: Scalars['String']['input'];
};


export type SubscriptionprojectVersionsPreviewGeneratedArgs = {
  id: Scalars['String']['input'];
};


export type SubscriptionprojectVersionsUpdatedArgs = {
  id: Scalars['String']['input'];
};


export type SubscriptionstreamDeletedArgs = {
  streamId?: InputMaybe<Scalars['String']['input']>;
};


export type SubscriptionstreamUpdatedArgs = {
  streamId?: InputMaybe<Scalars['String']['input']>;
};


export type SubscriptionviewerUserActivityBroadcastedArgs = {
  sessionId?: InputMaybe<Scalars['String']['input']>;
  target: ViewerUpdateTrackingTarget;
};


export type SubscriptionworkspacePlanUsageUpdatedArgs = {
  input: WorkspacePlanUsageSubscriptionInput;
};


export type SubscriptionworkspaceProjectsUpdatedArgs = {
  workspaceId?: InputMaybe<Scalars['String']['input']>;
  workspaceSlug?: InputMaybe<Scalars['String']['input']>;
};


export type SubscriptionworkspaceSupportSessionUpdatedArgs = {
  id: WorkspaceIdOrSlug;
};


export type SubscriptionworkspaceUpdatedArgs = {
  workspaceId?: InputMaybe<Scalars['String']['input']>;
  workspaceSlug?: InputMaybe<Scalars['String']['input']>;
};

/**
 * A Sync subscribes a CDE file to a Speckle model. Executions (runs) of a Sync
 * are represented by the SyncItem type; `latestItem` and `history` expose them.
 * `latestItemContext` and `modelIngestion` are convenience proxies for the
 * latest execution — prefer reading via `latestItem` for new code.
 */
export type Sync = {
  __typename?: 'Sync';
  /**
   * Whether this sync is active. When false, new executions are not triggered
   * on file changes. Toggled by pause/resume mutations.
   */
  active: Scalars['Boolean']['output'];
  author: Maybe<LimitedUser>;
  /** Static CDE config (region, hubId, lineageUrn, etc.) */
  context: Maybe<Scalars['JSONObject']['output']>;
  createdAt: Scalars['DateTime']['output'];
  fileExtension: Scalars['String']['output'];
  fileFolderPath: Maybe<Array<Scalars['String']['output']>>;
  fileId: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  fileParentFolderId: Maybe<Scalars['String']['output']>;
  /** Paginated history of sync executions (newest first) */
  history: SyncItemCollection;
  id: Scalars['ID']['output'];
  integration: Integration;
  /** Latest sync execution (same row surfaced via proxy fields above) */
  latestItem: Maybe<SyncItem>;
  /** Version-specific context from the latest sync execution */
  latestItemContext: Maybe<Scalars['JSONObject']['output']>;
  model: Model;
  /**
   * Model ingestion record for the latest sync execution, if any.
   * Exposes queued/processing/success/failed/cancelled status with progress.
   */
  modelIngestion: Maybe<ModelIngestion>;
  project: Project;
  updatedAt: Scalars['DateTime']['output'];
};


/**
 * A Sync subscribes a CDE file to a Speckle model. Executions (runs) of a Sync
 * are represented by the SyncItem type; `latestItem` and `history` expose them.
 * `latestItemContext` and `modelIngestion` are convenience proxies for the
 * latest execution — prefer reading via `latestItem` for new code.
 */
export type SynchistoryArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type SyncCollection = {
  __typename?: 'SyncCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Sync>;
  totalCount: Scalars['Int']['output'];
};

/**
 * A single sync execution — one run that downloads a file version from the CDE
 * and ingests it into Speckle. Executions accumulate per Sync and form its history.
 */
export type SyncItem = {
  __typename?: 'SyncItem';
  blobId: Maybe<Scalars['String']['output']>;
  /** Version-specific context captured at execution time (fileAuthorName, versionNumber, etc.) */
  context: Maybe<Scalars['JSONObject']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /**
   * Model ingestion record for this execution, if any. Use this for the
   * authoritative execution state — the sync-item row itself no longer
   * carries a status.
   */
  modelIngestion: Maybe<ModelIngestion>;
  modelIngestionId: Scalars['String']['output'];
  syncId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SyncItemCollection = {
  __typename?: 'SyncItemCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<SyncItem>;
  totalCount: Scalars['Int']['output'];
};

export type SyncMutations = {
  __typename?: 'SyncMutations';
  create: Sync;
  delete: Scalars['Boolean']['output'];
  /**
   * Promote a legacy ACC sync (still in `acc_sync_items`) into the new `syncs`
   * schema. Surfaced as a user-facing button so people don't have to wait for
   * the next ACC webhook for trigger-now / pause / edit to work. The lazy
   * migration that fires on real webhooks does the same job; this is just the
   * explicit version. Syncs already in the new schema return as-is.
   */
  migrateLegacy: Sync;
  /**
   * Pause or resume a sync. Paused syncs skip polling/webhook-driven executions
   * and reject `update(..., triggerNow: true)`. In-flight executions finish.
   */
  setActive: Sync;
  update: Sync;
};


export type SyncMutationscreateArgs = {
  input: CreateSyncInput;
};


export type SyncMutationsdeleteArgs = {
  input: DeleteSyncInput;
};


export type SyncMutationsmigrateLegacyArgs = {
  input: MigrateLegacySyncInput;
};


export type SyncMutationssetActiveArgs = {
  input: SetSyncActiveInput;
};


export type SyncMutationsupdateArgs = {
  input: UpdateSyncInput;
};

export type TaxIdData = {
  type: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type TestAutomationRun = {
  __typename?: 'TestAutomationRun';
  automationRunId: Scalars['String']['output'];
  functionRunId: Scalars['String']['output'];
  triggers: Array<TestAutomationRunTrigger>;
};

export type TestAutomationRunTrigger = {
  __typename?: 'TestAutomationRunTrigger';
  payload: TestAutomationRunTriggerPayload;
  triggerType: Scalars['String']['output'];
};

export type TestAutomationRunTriggerPayload = {
  __typename?: 'TestAutomationRunTriggerPayload';
  modelId: Scalars['String']['output'];
  versionId: Scalars['String']['output'];
};

export type TokenResourceIdentifier = {
  __typename?: 'TokenResourceIdentifier';
  id: Scalars['String']['output'];
  type: TokenResourceIdentifierType;
};

export type TokenResourceIdentifierInput = {
  id: Scalars['String']['input'];
  type: TokenResourceIdentifierType;
};

export enum TokenResourceIdentifierType {
  project = 'project',
  workspace = 'workspace'
}

export type TriggeredAutomationsStatus = {
  __typename?: 'TriggeredAutomationsStatus';
  automationRuns: Array<AutomateRun>;
  id: Scalars['ID']['output'];
  status: AutomateRunStatus;
  statusMessage: Maybe<Scalars['String']['output']>;
};

export type UpdateAccSyncItemInput = {
  id: Scalars['ID']['input'];
  projectId: Scalars['String']['input'];
  status: AccSyncItemStatus;
};

/** Any null values will be ignored */
export type UpdateAutomateFunctionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** SourceAppNames values from @speckle/shared */
  supportedSourceApps?: InputMaybe<Array<Scalars['String']['input']>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  workspaceIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateIssueInput = {
  assigneeId?: InputMaybe<Scalars['ID']['input']>;
  attachmentBlobIds?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['JSONObject']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  issueId: Scalars['ID']['input'];
  /** Supported in workspaced projects only. Use Workspace.issueLabels to get available labels. */
  labelIds?: InputMaybe<Array<Scalars['String']['input']>>;
  priority?: InputMaybe<IssuePriority>;
  projectId: Scalars['ID']['input'];
  /**
   * Resources of the project that this issue should be attached to. Empty means - general project issue, not tied
   * to any resources.
   */
  resourceIdString?: InputMaybe<Scalars['String']['input']>;
  screenshot?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<IssueStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** SerializedViewerState (type in @speckle/shared) */
  viewerState?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type UpdateIssueLabelInput = {
  hexColor?: InputMaybe<Scalars['String']['input']>;
  labelId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['ID']['input'];
};

export type UpdateModelInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
};

export type UpdateProjectLabelInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  /** Set to null to convert a label into a group */
  hexColor?: InputMaybe<Scalars['String']['input']>;
  labelId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  /** Set to null to ungroup a label */
  parentLabelId?: InputMaybe<Scalars['ID']['input']>;
  workspaceId: Scalars['ID']['input'];
};

export type UpdateProjectLabelsInput = {
  labelIds: Array<Scalars['ID']['input']>;
  projectId: Scalars['ID']['input'];
};

export type UpdateResourceMetaInput = {
  data?: InputMaybe<Scalars['JSON']['input']>;
  metaType?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  resourceId?: InputMaybe<Scalars['String']['input']>;
  resourceMetaId: Scalars['ID']['input'];
  resourceType?: InputMaybe<ResourceMetaType>;
  workspaceId: Scalars['String']['input'];
};

export type UpdateSavedViewGroupInput = {
  groupId: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
};

export type UpdateSavedViewInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  /** New group id, if grouping necessary */
  groupId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  /** Optionally also set this as the home/default view for the target model */
  isHomeView?: InputMaybe<Scalars['Boolean']['input']>;
  /** New name for the view */
  name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<ViewPositionInput>;
  projectId: Scalars['ID']['input'];
  /** New resource targets, if necessary. Must be set together w/ viewerState & screenshot. */
  resourceIdString?: InputMaybe<Scalars['String']['input']>;
  /** Encoded screenshot of the view. */
  screenshot?: InputMaybe<Scalars['String']['input']>;
  /**
   * SerializedViewerState. If omitted, comment won't render (correctly) inside the
   * viewer, but will still be retrievable through the API.
   * Must be set together w/ resourceIdString & screenshot.
   */
  viewerState?: InputMaybe<Scalars['JSONObject']['input']>;
  /** Optionally change visibility of the view */
  visibility?: InputMaybe<SavedViewVisibility>;
};

export type UpdateServerRegionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateShareTokenInput = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSyncInput = {
  context?: InputMaybe<Scalars['JSONObject']['input']>;
  id: Scalars['ID']['input'];
  projectId: Scalars['String']['input'];
  triggerNow?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Only non-null values will be updated */
export type UpdateVersionInput = {
  message?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
  versionId: Scalars['ID']['input'];
};

export type UpgradePlanInput = {
  billingInterval: BillingInterval;
  planAddOn?: InputMaybe<PlanAddOn>;
  workspacePlan: PaidWorkspacePlans;
  workspaceSlug: Scalars['String']['input'];
};

export type UpgradeToPaidlPlanInput = {
  billingAddress?: InputMaybe<BillingAddress>;
  billingDetails: BillingDetails;
  billingInterval: BillingInterval;
  paymentMethod: PaymentMethod;
  planAddOn?: InputMaybe<PlanAddOn>;
  taxIdData?: InputMaybe<TaxIdData>;
  workspacePlan: PaidWorkspacePlans;
  workspaceSlug: Scalars['String']['input'];
};

/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type User = {
  __typename?: 'User';
  /**
   * All active support sessions for the current user across all workspaces.
   * Used by the frontend to show support mode banners globally.
   */
  activeSupportSessions: Maybe<Array<WorkspaceSupportSession>>;
  /** The last-visited workspace for the given user */
  activeWorkspace: Maybe<LimitedWorkspace>;
  /**
   * All the recent activity from this user in chronological order
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  activity: Maybe<ActivityCollection>;
  /** Returns a list of your personal api tokens. */
  apiTokens: Array<ApiToken>;
  /** Returns the apps you have authorized. */
  authorizedApps: Maybe<Array<ServerAppListItem>>;
  automateFunctions: AutomateFunctionCollection;
  automateInfo: UserAutomateInfo;
  avatar: Maybe<Scalars['String']['output']>;
  bio: Maybe<Scalars['String']['output']>;
  /**
   * Get commits authored by the user. If requested for another user, then only commits
   * from public streams will be returned.
   * @deprecated Part of the old API surface and will be removed in the future. Use User.versions instead.
   */
  commits: Maybe<CommitCollection>;
  company: Maybe<Scalars['String']['output']>;
  /** Returns the apps you have created. */
  createdApps: Maybe<Array<ServerApp>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  /** Get discoverable workspaces with verified domains that match the active user's */
  discoverableWorkspaces: Array<LimitedWorkspace>;
  /** Only returned if API user is the user being requested or an admin */
  email: Maybe<Scalars['String']['output']>;
  emails: Array<UserEmail>;
  /**
   * A list of workspaces for the active user where:
   * (1) The user is a member or admin
   * (2) The workspace has SSO provider enabled
   * (3) The user does not have a valid SSO session for the given SSO provider
   */
  expiredSsoSessions: Array<LimitedWorkspace>;
  /** Whether the user has a pending/active email verification token */
  hasPendingVerification: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  /** Whether post-sign up onboarding has been finished or skipped entirely */
  isOnboardingFinished: Maybe<Scalars['Boolean']['output']>;
  meta: UserMeta;
  name: Scalars['String']['output'];
  notificationPreferences: Scalars['JSONObject']['output'];
  /** List all notifications for the user */
  notifications: UserNotificationCollection;
  permissions: RootPermissionChecks;
  profiles: Maybe<Scalars['JSONObject']['output']>;
  /** Get pending project access request, that the user made */
  projectAccessRequest: Maybe<ProjectAccessRequest>;
  /** Get all invitations to projects that the active user has */
  projectInvites: Array<PendingStreamCollaborator>;
  /** Get projects that the user participates in */
  projects: UserProjectCollection;
  role: Maybe<Scalars['String']['output']>;
  /**
   * Returns all streams that the user is a collaborator on. If requested for a user, who isn't the
   * authenticated user, then this will only return discoverable streams.
   * @deprecated Part of the old API surface and will be removed in the future. Use User.projects instead.
   */
  streams: UserStreamCollection;
  /**
   * The user's timeline in chronological order
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  timeline: Maybe<ActivityCollection>;
  /**
   * Total amount of favorites attached to streams owned by the user
   * @deprecated Part of the old API surface and will be removed in the future.
   */
  totalOwnedStreamsFavorites: Scalars['Int']['output'];
  verified: Maybe<Scalars['Boolean']['output']>;
  /**
   * Get (count of) user's versions. By default gets all versions of all projects the user has access to.
   * Set authoredOnly=true to only retrieve versions authored by the user.
   *
   * Note: Only count resolution is currently implemented
   */
  versions: CountOnlyCollection;
  /** Get all invitations to workspaces that the active user has */
  workspaceInvites: Array<PendingWorkspaceCollaborator>;
  workspaceJoinRequests: Maybe<LimitedWorkspaceJoinRequestCollection>;
  /** Get the workspaces for the user */
  workspaces: WorkspaceCollection;
};


/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type UseractivityArgs = {
  actionType?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['DateTime']['input']>;
  before?: InputMaybe<Scalars['DateTime']['input']>;
  cursor?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
};


/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type UserautomateFunctionsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AutomateFunctionsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type UsercommitsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type UsernotificationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type UserprojectAccessRequestArgs = {
  projectId: Scalars['String']['input'];
};


/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type UserprojectsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<UserProjectsFilter>;
  limit?: Scalars['Int']['input'];
  sortBy?: InputMaybe<Array<Scalars['String']['input']>>;
};


/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type UserstreamsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type UsertimelineArgs = {
  after?: InputMaybe<Scalars['DateTime']['input']>;
  before?: InputMaybe<Scalars['DateTime']['input']>;
  cursor?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
};


/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type UserversionsArgs = {
  authoredOnly?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
};


/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type UserworkspaceJoinRequestsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<WorkspaceJoinRequestFilter>;
  limit?: Scalars['Int']['input'];
};


/**
 * Full user type, should only be used in the context of admin operations or
 * when a user is reading/writing info about himself
 */
export type UserworkspacesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<UserWorkspacesFilter>;
  limit?: Scalars['Int']['input'];
};

export type UserAutomateInfo = {
  __typename?: 'UserAutomateInfo';
  availableGithubOrgs: Array<Scalars['String']['output']>;
  hasAutomateGithubApp: Scalars['Boolean']['output'];
};

export type UserDeleteInput = {
  email: Scalars['String']['input'];
};

export type UserEmail = {
  __typename?: 'UserEmail';
  distinctId: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  primary: Scalars['Boolean']['output'];
  userId: Scalars['ID']['output'];
  verified: Scalars['Boolean']['output'];
};

export type UserEmailMutations = {
  __typename?: 'UserEmailMutations';
  create: User;
  delete: User;
  requestNewEmailVerification: SentEmailInfo;
  setPrimary: User;
  verify: Maybe<Scalars['Boolean']['output']>;
};


export type UserEmailMutationscreateArgs = {
  input: CreateUserEmailInput;
};


export type UserEmailMutationsdeleteArgs = {
  input: DeleteUserEmailInput;
};


export type UserEmailMutationsrequestNewEmailVerificationArgs = {
  input: EmailVerificationRequestInput;
};


export type UserEmailMutationssetPrimaryArgs = {
  input: SetPrimaryUserEmailInput;
};


export type UserEmailMutationsverifyArgs = {
  input: VerifyUserEmailInput;
};

export type UserMeta = {
  __typename?: 'UserMeta';
  flag: Scalars['Boolean']['output'];
  intelligenceCommunityStandUpBannerDismissed: Scalars['Boolean']['output'];
  legacyProjectsExplainerCollapsed: Scalars['Boolean']['output'];
  newWorkspaceExplainerDismissed: Scalars['Boolean']['output'];
  speckleCon25BannerDismissed: Scalars['Boolean']['output'];
  speckleConBannerDismissed: Scalars['Boolean']['output'];
};


export type UserMetaflagArgs = {
  key: Scalars['String']['input'];
};

export type UserMetaMutations = {
  __typename?: 'UserMetaMutations';
  setFlag: Scalars['Boolean']['output'];
  setIntelligenceCommunityStandUpBannerDismissed: Scalars['Boolean']['output'];
  setLegacyProjectsExplainerCollapsed: Scalars['Boolean']['output'];
  setNewWorkspaceExplainerDismissed: Scalars['Boolean']['output'];
  setSpeckleCon25BannerDismissed: Scalars['Boolean']['output'];
  setSpeckleConBannerDismissed: Scalars['Boolean']['output'];
};


export type UserMetaMutationssetFlagArgs = {
  key: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
};


export type UserMetaMutationssetIntelligenceCommunityStandUpBannerDismissedArgs = {
  value: Scalars['Boolean']['input'];
};


export type UserMetaMutationssetLegacyProjectsExplainerCollapsedArgs = {
  value: Scalars['Boolean']['input'];
};


export type UserMetaMutationssetNewWorkspaceExplainerDismissedArgs = {
  value: Scalars['Boolean']['input'];
};


export type UserMetaMutationssetSpeckleCon25BannerDismissedArgs = {
  value: Scalars['Boolean']['input'];
};


export type UserMetaMutationssetSpeckleConBannerDismissedArgs = {
  value: Scalars['Boolean']['input'];
};

export type UserNotificationCollection = {
  __typename?: 'UserNotificationCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Notification>;
  totalCount: Scalars['Int']['output'];
};

export type UserProjectCollection = {
  __typename?: 'UserProjectCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Project>;
  numberOfHidden: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type UserProjectsFilter = {
  /**
   * If set to true, will also include streams that the user may not have an explicit role on,
   * but has implicit access to because of workspaces
   */
  includeImplicitAccess?: InputMaybe<Scalars['Boolean']['input']>;
  /** Only include projects where user has the specified roles */
  onlyWithRoles?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Only include personal projects (not in any workspace) */
  personalOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter out projects by name */
  search?: InputMaybe<Scalars['String']['input']>;
  /** Only include projects in the specified workspace */
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
  /** Only include projects in the specified workspace (by slug) */
  workspaceSlug?: InputMaybe<Scalars['String']['input']>;
};

export type UserProjectsUpdatedMessage = {
  __typename?: 'UserProjectsUpdatedMessage';
  /** Project ID */
  id: Scalars['String']['output'];
  /** Project entity, null if project was deleted */
  project: Maybe<Project>;
  /** Message type */
  type: UserProjectsUpdatedMessageType;
};

export enum UserProjectsUpdatedMessageType {
  ADDED = 'ADDED',
  REMOVED = 'REMOVED'
}

export type UserRoleInput = {
  id: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type UserSearchResultCollection = {
  __typename?: 'UserSearchResultCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<LimitedUser>;
};

export type UserStreamCollection = {
  __typename?: 'UserStreamCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Maybe<Array<Stream>>;
  numberOfHidden: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type UserUpdateInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  company?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UserWorkspacesFilter = {
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type UsersRetrievalInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  /** Only find users with directly matching emails */
  emailOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /** Limit defaults to 10 */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Only find users that are collaborators of the specified project */
  projectId?: InputMaybe<Scalars['String']['input']>;
  /** The query looks for matches in user name & email */
  query: Scalars['String']['input'];
};

export type VerifyUserEmailInput = {
  code: Scalars['String']['input'];
  email: Scalars['String']['input'];
};

export type Version = {
  __typename?: 'Version';
  authorUser: Maybe<LimitedUser>;
  automationsStatus: Maybe<TriggeredAutomationsStatus>;
  /**
   * All comment threads in this version
   * @deprecated Comments were moved to issues. Use project.issues instead. Field will be removed after 01 Jun 2026.
   */
  commentThreads: CommentCollection;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  message: Maybe<Scalars['String']['output']>;
  model: Model;
  objectKey: Maybe<Scalars['String']['output']>;
  packfileSize: Maybe<Scalars['BigInt']['output']>;
  parents: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  permissions: VersionPermissionChecks;
  previewUrl: Scalars['String']['output'];
  referencedObject: Maybe<Scalars['String']['output']>;
  sourceApplication: Maybe<Scalars['String']['output']>;
  totalChildrenCount: Maybe<Scalars['Int']['output']>;
};


export type VersioncommentThreadsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};

export type VersionCollection = {
  __typename?: 'VersionCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Version>;
  totalCount: Scalars['Int']['output'];
};

export type VersionCreatedTrigger = {
  __typename?: 'VersionCreatedTrigger';
  model: Maybe<Model>;
  type: AutomateRunTriggerType;
  version: Maybe<Version>;
};

export type VersionCreatedTriggerDefinition = {
  __typename?: 'VersionCreatedTriggerDefinition';
  model: Maybe<Model>;
  type: AutomateRunTriggerType;
};

export type VersionMutations = {
  __typename?: 'VersionMutations';
  create: Version;
  delete: Scalars['Boolean']['output'];
  markReceived: Scalars['Boolean']['output'];
  /**
   * Re-enqueue a legacy version for packfile/EAV migration. Idempotent: returns
   * true even if the version is already migrated. Requires contributor-level
   * access on the project.
   */
  migrate: Scalars['Boolean']['output'];
  /**
   * Re-enqueue all unmigrated legacy versions in a project for packfile/EAV
   * migration, newest first. Returns the number of jobs enqueued. Capped at 5000
   * per call (use the CLI for larger batches). Requires owner-level access on
   * the project.
   */
  migrateProject: Scalars['Int']['output'];
  moveToModel: Model;
  update: Version;
};


export type VersionMutationscreateArgs = {
  input: CreateVersionInput;
};


export type VersionMutationsdeleteArgs = {
  input: DeleteVersionsInput;
};


export type VersionMutationsmarkReceivedArgs = {
  input: MarkReceivedVersionInput;
};


export type VersionMutationsmigrateArgs = {
  input: MigrateVersionInput;
};


export type VersionMutationsmigrateProjectArgs = {
  input: MigrateProjectInput;
};


export type VersionMutationsmoveToModelArgs = {
  input: MoveVersionsInput;
};


export type VersionMutationsupdateArgs = {
  input: UpdateVersionInput;
};

export type VersionPermissionChecks = {
  __typename?: 'VersionPermissionChecks';
  canLoad: PermissionCheckResult;
  /** @deprecated Use `canLoad` instead */
  canReceive: PermissionCheckResult;
  canUpdate: PermissionCheckResult;
};

export type VersionQueryResult = {
  __typename?: 'VersionQueryResult';
  createdAt: Scalars['DateTime']['output'];
  durationMs: Scalars['Int']['output'];
  result: Scalars['JSONObject']['output'];
  summary: Scalars['JSONObject']['output'];
  versionId: Scalars['String']['output'];
};

/**
 * If only one is set, the other will be resolved automatically
 * If none are set, the view will be added to the end of the list
 */
export type ViewPositionInput = {
  /** The ID of the view that should be after the new position */
  afterViewId?: InputMaybe<Scalars['ID']['input']>;
  /** The ID of the view that should be before the new position */
  beforeViewId?: InputMaybe<Scalars['ID']['input']>;
  type: ViewPositionInputType;
};

export enum ViewPositionInputType {
  between = 'between'
}

export type ViewerResourceGroup = {
  __typename?: 'ViewerResourceGroup';
  /** Resource identifier used to refer to a collection of resource items */
  identifier: Scalars['String']['output'];
  /**
   * True, if the group was resolved only for preloading purposes, not because the main
   * resourceIdString referred to it
   */
  isPreloadOnly: Maybe<Scalars['Boolean']['output']>;
  /** Viewer resources that the identifier refers to */
  items: Array<ViewerResourceItem>;
};

export type ViewerResourceItem = {
  __typename?: 'ViewerResourceItem';
  /** Null if resource represents an object */
  modelId: Maybe<Scalars['String']['output']>;
  objectId: Scalars['String']['output'];
  /** Null if resource represents an object */
  versionId: Maybe<Scalars['String']['output']>;
};

export type ViewerUpdateTrackingTarget = {
  /**
   * By default if resourceIdString is set, the "versionId" part of model resource identifiers will be ignored
   * and all updates to of all versions of any of the referenced models will be returned. If `loadedVersionsOnly` is
   * enabled, then only updates of loaded/referenced versions in resourceIdString will be returned.
   */
  loadedVersionsOnly?: InputMaybe<Scalars['Boolean']['input']>;
  projectId: Scalars['String']['input'];
  /**
   * Only request updates to the resources identified by this
   * comma-delimited resouce string (same format that's used in the viewer URL)
   */
  resourceIdString: Scalars['String']['input'];
};

export type ViewerUserActivityMessage = {
  __typename?: 'ViewerUserActivityMessage';
  sessionId: Scalars['String']['output'];
  /** SerializedViewerState, only null if DISCONNECTED */
  state: Maybe<Scalars['JSONObject']['output']>;
  status: ViewerUserActivityStatus;
  user: Maybe<LimitedUser>;
  userId: Maybe<Scalars['String']['output']>;
  userName: Scalars['String']['output'];
};

export type ViewerUserActivityMessageInput = {
  sessionId: Scalars['String']['input'];
  /** SerializedViewerState, only null if DISCONNECTED */
  state?: InputMaybe<Scalars['JSONObject']['input']>;
  status: ViewerUserActivityStatus;
  userId?: InputMaybe<Scalars['String']['input']>;
  userName: Scalars['String']['input'];
};

export enum ViewerUserActivityStatus {
  DISCONNECTED = 'DISCONNECTED',
  VIEWING = 'VIEWING'
}

export type Webhook = {
  __typename?: 'Webhook';
  description: Maybe<Scalars['String']['output']>;
  enabled: Maybe<Scalars['Boolean']['output']>;
  hasSecret: Scalars['Boolean']['output'];
  history: Maybe<WebhookEventCollection>;
  id: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  streamId: Scalars['String']['output'];
  triggers: Array<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};


export type WebhookhistoryArgs = {
  limit?: Scalars['Int']['input'];
};

export type WebhookCollection = {
  __typename?: 'WebhookCollection';
  items: Array<Webhook>;
  totalCount: Scalars['Int']['output'];
};

export type WebhookCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  secret?: InputMaybe<Scalars['String']['input']>;
  streamId: Scalars['String']['input'];
  triggers: Array<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type WebhookDeleteInput = {
  id: Scalars['String']['input'];
  streamId: Scalars['String']['input'];
};

export type WebhookEvent = {
  __typename?: 'WebhookEvent';
  id: Scalars['String']['output'];
  lastUpdate: Scalars['DateTime']['output'];
  payload: Scalars['String']['output'];
  retryCount: Scalars['Int']['output'];
  status: Scalars['Int']['output'];
  statusInfo: Scalars['String']['output'];
  webhookId: Scalars['String']['output'];
};

export type WebhookEventCollection = {
  __typename?: 'WebhookEventCollection';
  items: Maybe<Array<Maybe<WebhookEvent>>>;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type WebhookUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['String']['input'];
  secret?: InputMaybe<Scalars['String']['input']>;
  streamId: Scalars['String']['input'];
  triggers?: InputMaybe<Array<Scalars['String']['input']>>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type Workspace = {
  __typename?: 'Workspace';
  /**
   * The current user's active or pending support session for this workspace.
   * Null if the current user has no active/pending session.
   * Only relevant for server admins — used to show the support mode CTA state.
   */
  activeSupportSession: Maybe<WorkspaceSupportSession>;
  /** Get all join requests for all the workspaces the user is an admin of */
  adminWorkspacesJoinRequests: Maybe<WorkspaceJoinRequestCollection>;
  automateFunctions: AutomateFunctionCollection;
  createdAt: Scalars['DateTime']['output'];
  /**
   * Info about the workspace creation state
   * @deprecated workspaces no longer have creation state, is always created true. Field will be removed after 01 Jun 2026
   */
  creationState: Maybe<WorkspaceCreationState>;
  customerPortalUrl: Maybe<Scalars['String']['output']>;
  dashboards: DashboardCollection;
  /**
   * The default role workspace members will receive for workspace projects.
   * @deprecated Always the reviewer role. Will be removed in the future.
   */
  defaultProjectRole: Scalars['String']['output'];
  /**
   * The default region where project data will be stored, if set. If undefined, defaults to main/default
   * region.
   */
  defaultRegion: Maybe<ServerRegionItem>;
  /** The default seat assigned to users that join a workspace. Used during workspace discovery or on invites without seat types. */
  defaultSeatType: WorkspaceSeatType;
  description: Maybe<Scalars['String']['output']>;
  /** If true, allow users to automatically join discoverable workspaces (instead of requesting to join) */
  discoverabilityAutoJoinEnabled: Scalars['Boolean']['output'];
  /** Enable/Disable discovery of the workspace */
  discoverabilityEnabled: Scalars['Boolean']['output'];
  /** Enable/Disable restriction to invite users to workspace as Guests only */
  domainBasedMembershipProtectionEnabled: Scalars['Boolean']['output'];
  /** Verified workspace domains */
  domains: Maybe<Array<WorkspaceDomain>>;
  /** Workspace-level configuration for models in embedded viewer */
  embedOptions: WorkspaceEmbedOptions;
  /** @deprecated Use specific auth policies instead */
  hasAccessToFeature: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  integrations: Maybe<WorkspaceIntegrations>;
  /** Only available to workspace owners/members */
  invitedTeam: Maybe<Array<PendingWorkspaceCollaborator>>;
  /** Exclusive workspaces do not allow their workspace members to create or join other workspaces as members. */
  isExclusive: Scalars['Boolean']['output'];
  /** List all issue labels for this workspace */
  issueLabels: IssueLabelCollection;
  /**
   * Logo image as base64-encoded string
   * @deprecated Use the `workspace.logoUrl` field instead. Will be removed after June 2026.
   */
  logo: Maybe<Scalars['String']['output']>;
  /** URL for pulling the workspace logo image */
  logoUrl: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  permissions: WorkspacePermissionChecks;
  plan: Maybe<WorkspacePlan>;
  /** Shows the plan prices localized for the given workspace */
  planPrices: Maybe<WorkspacePaidPlanPrices>;
  /**
   * Bulk project activity data for the workspace timeline widget.
   * Returns versions created within a date window, grouped by project.
   * First call discovers top N projects; pass the returned cursor to load older data.
   * Internal API — may change without notice.
   */
  projectActivityTimeline: Maybe<WorkspaceProjectActivityTimelineResult>;
  /** List all project labels defined for this workspace */
  projectLabels: WorkspaceProjectLabelCollection;
  projects: ProjectCollection;
  /** A Workspace is marked as readOnly if its trial period is finished or a paid plan is subscribed but payment has failed */
  readOnly: Scalars['Boolean']['output'];
  /** Active user's role for this workspace. `null` if request is not authenticated, or the workspace is not explicitly shared with you. */
  role: Maybe<Scalars['String']['output']>;
  scim: Maybe<WorkspaceScimConfig>;
  /** Active user's seat type for this workspace. `null` if request is not authenticated, or the workspace is not explicitly shared with you. */
  seatType: Maybe<WorkspaceSeatType>;
  seats: Maybe<WorkspaceSubscriptionSeats>;
  shareTokens: ShareTokenCollection;
  slug: Scalars['String']['output'];
  /** Information about the workspace's SSO configuration and the current user's SSO session, if present */
  sso: Maybe<WorkspaceSso>;
  subscription: Maybe<WorkspaceSubscription>;
  /**
   * Paginated list of support sessions for this workspace.
   * Includes pending, active, revoked, and expired sessions.
   * Only accessible to workspace admins.
   */
  supportSessions: WorkspaceSupportSessionCollection;
  team: WorkspaceCollaboratorCollection;
  teamByRole: WorkspaceTeamByRole;
  updatedAt: Scalars['DateTime']['output'];
};


export type WorkspaceadminWorkspacesJoinRequestsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AdminWorkspaceJoinRequestFilter>;
  limit?: Scalars['Int']['input'];
};


export type WorkspaceautomateFunctionsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AutomateFunctionsFilter>;
  limit?: Scalars['Int']['input'];
};


export type WorkspacedashboardsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<WorkspaceDashboardsFilter>;
  limit?: Scalars['Int']['input'];
};


export type WorkspacehasAccessToFeatureArgs = {
  featureName: WorkspaceFeatureName;
};


export type WorkspaceinvitedTeamArgs = {
  filter?: InputMaybe<PendingWorkspaceCollaboratorsFilter>;
};


export type WorkspaceissueLabelsArgs = {
  input: WorkspaceIssueLabelsInput;
};


export type WorkspaceprojectActivityTimelineArgs = {
  input: WorkspaceProjectActivityTimelineInput;
};


export type WorkspaceprojectLabelsArgs = {
  input: WorkspaceProjectLabelsInput;
};


export type WorkspaceprojectsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<WorkspaceProjectsFilter>;
  limit?: Scalars['Int']['input'];
};


export type WorkspaceshareTokensArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<WorkspaceShareTokensFilter>;
  limit?: Scalars['Int']['input'];
};


export type WorkspacesupportSessionsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<WorkspaceSupportSessionFilter>;
  limit?: Scalars['Int']['input'];
};


export type WorkspaceteamArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<WorkspaceTeamFilter>;
  limit?: Scalars['Int']['input'];
};

export type WorkspaceBillingMutations = {
  __typename?: 'WorkspaceBillingMutations';
  upgradePlan: Scalars['Boolean']['output'];
  upgradeToPaidPlan: Invoice;
};


export type WorkspaceBillingMutationsupgradePlanArgs = {
  input: UpgradePlanInput;
};


export type WorkspaceBillingMutationsupgradeToPaidPlanArgs = {
  input: UpgradeToPaidlPlanInput;
};

/** Overridden by `WorkspaceCollaboratorGraphQLReturn` */
export type WorkspaceCollaborator = {
  __typename?: 'WorkspaceCollaborator';
  email: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Date that the user joined the workspace. */
  joinDate: Scalars['DateTime']['output'];
  projectRoles: Array<ProjectRole>;
  role: Scalars['String']['output'];
  seatType: Maybe<WorkspaceSeatType>;
  user: LimitedUser;
};

export type WorkspaceCollaboratorCollection = {
  __typename?: 'WorkspaceCollaboratorCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<WorkspaceCollaborator>;
  totalCount: Scalars['Int']['output'];
};

export type WorkspaceCollection = {
  __typename?: 'WorkspaceCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<Workspace>;
  totalCount: Scalars['Int']['output'];
};

export type WorkspaceCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  /** Add this domain to the workspace as a verified domain and enable domain discoverability */
  enableDomainDiscoverabilityForDomain?: InputMaybe<Scalars['String']['input']>;
  /** Logo image as base64-encoded string */
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type WorkspaceCreationState = {
  __typename?: 'WorkspaceCreationState';
  completed: Scalars['Boolean']['output'];
  state: Scalars['JSONObject']['output'];
};

export type WorkspaceCreationStateInput = {
  completed: Scalars['Boolean']['input'];
  state: Scalars['JSONObject']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type WorkspaceDashboardsFilter = {
  projectIds?: InputMaybe<Array<Scalars['String']['input']>>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type WorkspaceDismissInput = {
  workspaceId: Scalars['ID']['input'];
};

export type WorkspaceDomain = {
  __typename?: 'WorkspaceDomain';
  createdAt: Scalars['DateTime']['output'];
  /** User could be deleted */
  createdBy: Maybe<LimitedUser>;
  domain: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type WorkspaceDomainDeleteInput = {
  id: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type WorkspaceEmbedOptions = {
  __typename?: 'WorkspaceEmbedOptions';
  hideSpeckleBranding: Scalars['Boolean']['output'];
};

/** Either the ID or slug must be set */
export type WorkspaceFeatureGrantUpdateInput = {
  featureName: WorkspaceFeatureName;
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
  workspaceSlug?: InputMaybe<Scalars['String']['input']>;
};

export enum WorkspaceFeatureName {
  accIntegration = 'accIntegration',
  automate = 'automate',
  bentleyIntegration = 'bentleyIntegration',
  /** @deprecated Use projectDashboards instead. Value will be dropped after July 19, 2026. */
  dashboards = 'dashboards',
  dashboardsExperimental = 'dashboardsExperimental',
  domainBasedSecurityPolicies = 'domainBasedSecurityPolicies',
  domainDiscoverability = 'domainDiscoverability',
  embedPrivateProjects = 'embedPrivateProjects',
  exclusiveMembership = 'exclusiveMembership',
  frontend3 = 'frontend3',
  helpCenter = 'helpCenter',
  hideSpeckleBranding = 'hideSpeckleBranding',
  issues = 'issues',
  markup = 'markup',
  modelValidation = 'modelValidation',
  oidcSso = 'oidcSso',
  portfolioDashboards = 'portfolioDashboards',
  presentation = 'presentation',
  /** @deprecated Use presentation instead. Value will be dropped after July 19, 2026. */
  presentations = 'presentations',
  projectArchival = 'projectArchival',
  projectDashboards = 'projectDashboards',
  savedViews = 'savedViews',
  scim2Provisioning = 'scim2Provisioning',
  viewer3 = 'viewer3',
  viewerTable = 'viewerTable',
  workspaceDataRegionSpecificity = 'workspaceDataRegionSpecificity'
}

/** One of the fields must be set, with id taking precedence */
export type WorkspaceIdOrSlug = {
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type WorkspaceIdentifier = {
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type WorkspaceIntegrations = {
  __typename?: 'WorkspaceIntegrations';
  acc: Maybe<AccIntegration>;
  projectWise: Maybe<ProjectWiseIntegration>;
};


export type WorkspaceIntegrationsaccArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};


export type WorkspaceIntegrationsprojectWiseArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};

export type WorkspaceInviteCreateInput = {
  /** Either this or userId must be filled */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Defaults to the member role, if not specified */
  role?: InputMaybe<WorkspaceRole>;
  /** The workspace seat type to assign to the user upon accepting the invite. */
  seatType?: InputMaybe<WorkspaceSeatType>;
  /** Defaults to User, if not specified */
  serverRole?: InputMaybe<ServerRole>;
  /** Either this or email must be filled */
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type WorkspaceInviteLookupOptions = {
  /** If true, the query will assume workspaceId is actually the workspace slug, and do the lookup by slug */
  useSlug?: InputMaybe<Scalars['Boolean']['input']>;
};

export type WorkspaceInviteMutations = {
  __typename?: 'WorkspaceInviteMutations';
  batchCreate: Workspace;
  cancel: Workspace;
  create: Workspace;
  resend: Scalars['Boolean']['output'];
  use: Scalars['Boolean']['output'];
};


export type WorkspaceInviteMutationsbatchCreateArgs = {
  input: Array<WorkspaceInviteCreateInput>;
  workspaceId: Scalars['String']['input'];
};


export type WorkspaceInviteMutationscancelArgs = {
  inviteId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type WorkspaceInviteMutationscreateArgs = {
  input: WorkspaceInviteCreateInput;
  workspaceId: Scalars['String']['input'];
};


export type WorkspaceInviteMutationsresendArgs = {
  input: WorkspaceInviteResendInput;
};


export type WorkspaceInviteMutationsuseArgs = {
  input: WorkspaceInviteUseInput;
};

export type WorkspaceInviteResendInput = {
  inviteId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type WorkspaceInviteUseInput = {
  accept: Scalars['Boolean']['input'];
  /**
   * If invite is attached to an unregistered email, the invite can only be used if this is set to true.
   * Upon accepting such an invite, the unregistered email will be added to the user's account as well.
   */
  addNewEmail?: InputMaybe<Scalars['Boolean']['input']>;
  token: Scalars['String']['input'];
};

export type WorkspaceIssueLabelMutations = {
  __typename?: 'WorkspaceIssueLabelMutations';
  createIssueLabel: IssueLabel;
  deleteIssueLabel: Scalars['Boolean']['output'];
  updateIssueLabel: IssueLabel;
};


export type WorkspaceIssueLabelMutationscreateIssueLabelArgs = {
  input: CreateIssueLabelInput;
};


export type WorkspaceIssueLabelMutationsdeleteIssueLabelArgs = {
  input: DeleteIssueLabelInput;
};


export type WorkspaceIssueLabelMutationsupdateIssueLabelArgs = {
  input: UpdateIssueLabelInput;
};

export enum WorkspaceIssueLabelSortBy {
  lastUsedAt = 'lastUsedAt',
  name = 'name'
}

export type WorkspaceIssueLabelsInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  /**
   * Maximum 100
   * Default: 25
   */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Filter by name */
  search?: InputMaybe<Scalars['String']['input']>;
  /**
   * Specify the field to sort by.
   * Default: lastUsedAt
   */
  sortBy?: InputMaybe<WorkspaceIssueLabelSortBy>;
  /**
   * Specify the sort direction.
   * Default: desc
   */
  sortDirection?: InputMaybe<SortOrder>;
};

export type WorkspaceJoinRequest = {
  __typename?: 'WorkspaceJoinRequest';
  createdAt: Scalars['DateTime']['output'];
  email: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  status: WorkspaceJoinRequestStatus;
  user: LimitedUser;
  workspace: Workspace;
};

export type WorkspaceJoinRequestCollection = {
  __typename?: 'WorkspaceJoinRequestCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<WorkspaceJoinRequest>;
  totalCount: Scalars['Int']['output'];
};

export type WorkspaceJoinRequestFilter = {
  status?: InputMaybe<WorkspaceJoinRequestStatus>;
};

export type WorkspaceJoinRequestMutations = {
  __typename?: 'WorkspaceJoinRequestMutations';
  approve: Scalars['Boolean']['output'];
  deny: Scalars['Boolean']['output'];
};


export type WorkspaceJoinRequestMutationsapproveArgs = {
  input: ApproveWorkspaceJoinRequestInput;
};


export type WorkspaceJoinRequestMutationsdenyArgs = {
  input: DenyWorkspaceJoinRequestInput;
};

export enum WorkspaceJoinRequestStatus {
  approved = 'approved',
  denied = 'denied',
  pending = 'pending'
}

export type WorkspaceLimits = {
  __typename?: 'WorkspaceLimits';
  commentsHistoryInDays: Maybe<Scalars['Int']['output']>;
  dashboardCount: Maybe<Scalars['Int']['output']>;
  modelCount: Maybe<Scalars['Int']['output']>;
  projectCount: Maybe<Scalars['Int']['output']>;
  userCount: Maybe<Scalars['Int']['output']>;
  versionCount: Maybe<Scalars['Int']['output']>;
  versionsHistoryInDays: Maybe<Scalars['Int']['output']>;
};

/**
 * Supported values:
 * - number e.g. "10" for exact limits
 * - "unlimited" for unlimited
 * - "unset" to unset override, go back to defaults
 */
export type WorkspaceLimitsInput = {
  commentsHistoryInDays?: InputMaybe<Scalars['String']['input']>;
  dashboardCount?: InputMaybe<Scalars['String']['input']>;
  modelCount?: InputMaybe<Scalars['String']['input']>;
  projectCount?: InputMaybe<Scalars['String']['input']>;
  userCount?: InputMaybe<Scalars['String']['input']>;
  versionCount?: InputMaybe<Scalars['String']['input']>;
  versionsHistoryInDays?: InputMaybe<Scalars['String']['input']>;
};

/** Either the ID or slug must be set */
export type WorkspaceLimitsUpdateInput = {
  limits?: InputMaybe<WorkspaceLimitsInput>;
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
  workspaceSlug?: InputMaybe<Scalars['String']['input']>;
};

export type WorkspaceMutations = {
  __typename?: 'WorkspaceMutations';
  addDomain: Workspace;
  billing: WorkspaceBillingMutations;
  create: Workspace;
  delete: Scalars['Boolean']['output'];
  deleteDomain: Workspace;
  deleteSsoProvider: Scalars['Boolean']['output'];
  /** Revoke the SSO session for a specific user in a workspace. Only workspace admins can perform this action. */
  deleteSsoSession: Scalars['Boolean']['output'];
  disableScim: Scalars['Boolean']['output'];
  /** Dismiss a workspace from the discoverable list, behind the scene a join request is created with the status "dismissed" */
  dismiss: Scalars['Boolean']['output'];
  enableScim: WorkspaceScimTokenResult;
  invites: WorkspaceInviteMutations;
  issueLabels: WorkspaceIssueLabelMutations;
  leave: Scalars['Boolean']['output'];
  projectLabels: WorkspaceProjectLabelMutations;
  projects: WorkspaceProjectMutations;
  regenerateScimToken: WorkspaceScimTokenResult;
  requestToJoin: Scalars['Boolean']['output'];
  /** Set the default region where project data will be stored. Only available to admins. */
  setDefaultRegion: Workspace;
  /** Support session management mutations */
  support: WorkspaceSupportMutations;
  update: Workspace;
  /** @deprecated workspaces no longer have creation state, is always created true. Field will be removed after 01 Jun 2026 */
  updateCreationState: Scalars['Boolean']['output'];
  updateEmbedOptions: WorkspaceEmbedOptions;
  updateRole: Workspace;
  updateSeatType: Workspace;
  /** Update the SSO provider details for a workspace. */
  updateSsoProvider: Scalars['Boolean']['output'];
};


export type WorkspaceMutationsaddDomainArgs = {
  input: AddDomainToWorkspaceInput;
};


export type WorkspaceMutationscreateArgs = {
  input: WorkspaceCreateInput;
};


export type WorkspaceMutationsdeleteArgs = {
  workspaceId: Scalars['String']['input'];
};


export type WorkspaceMutationsdeleteDomainArgs = {
  input: WorkspaceDomainDeleteInput;
};


export type WorkspaceMutationsdeleteSsoProviderArgs = {
  workspaceId: Scalars['String']['input'];
};


export type WorkspaceMutationsdeleteSsoSessionArgs = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type WorkspaceMutationsdisableScimArgs = {
  workspaceId: Scalars['String']['input'];
};


export type WorkspaceMutationsdismissArgs = {
  input: WorkspaceDismissInput;
};


export type WorkspaceMutationsenableScimArgs = {
  input: EnableWorkspaceScimInput;
};


export type WorkspaceMutationsleaveArgs = {
  id: Scalars['ID']['input'];
};


export type WorkspaceMutationsregenerateScimTokenArgs = {
  workspaceId: Scalars['String']['input'];
};


export type WorkspaceMutationsrequestToJoinArgs = {
  input: WorkspaceRequestToJoinInput;
};


export type WorkspaceMutationssetDefaultRegionArgs = {
  regionKey: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type WorkspaceMutationsupdateArgs = {
  input: WorkspaceUpdateInput;
};


export type WorkspaceMutationsupdateCreationStateArgs = {
  input: WorkspaceCreationStateInput;
};


export type WorkspaceMutationsupdateEmbedOptionsArgs = {
  input: WorkspaceUpdateEmbedOptionsInput;
};


export type WorkspaceMutationsupdateRoleArgs = {
  input: WorkspaceRoleUpdateInput;
};


export type WorkspaceMutationsupdateSeatTypeArgs = {
  input: WorkspaceUpdateSeatTypeInput;
};


export type WorkspaceMutationsupdateSsoProviderArgs = {
  input: WorkspaceSsoProviderUpdateInput;
};

export type WorkspacePaidPlanPrices = {
  __typename?: 'WorkspacePaidPlanPrices';
  business: WorkspacePlanPrice;
  /** Price of a single Business plan add-on pack (grants extra projects and versions). */
  businessAddOn: WorkspacePlanPrice;
};

export enum WorkspacePaymentMethod {
  billing = 'billing',
  invoice = 'invoice',
  unpaid = 'unpaid'
}

export type WorkspacePermissionChecks = {
  __typename?: 'WorkspacePermissionChecks';
  canAcceptJoinRequest: PermissionCheckResult;
  canAccessDashboards: PermissionCheckResult;
  /** Whether the current user can access the help center for this workspace, eg. support chats, etc */
  canAccessHelpCenter: PermissionCheckResult;
  canAccessSso: PermissionCheckResult;
  canAccessViewer3: PermissionCheckResult;
  canChangeSeatType: PermissionCheckResult;
  canCreateDashboards: PermissionCheckResult;
  canCreateProject: PermissionCheckResult;
  canDelete: PermissionCheckResult;
  canDeleteInvite: PermissionCheckResult;
  canDeleteSsoSession: PermissionCheckResult;
  canEditEmbedOptions: PermissionCheckResult;
  canEditWorkspaceIssueLabels: PermissionCheckResult;
  canEditWorkspaceProjectLabels: PermissionCheckResult;
  canInvite: PermissionCheckResult;
  canLeave: PermissionCheckResult;
  canListDashboards: PermissionCheckResult;
  canListShareTokens: PermissionCheckResult;
  canMakeWorkspaceExclusive: PermissionCheckResult;
  canManageDomainBasedSecurityPolicies: PermissionCheckResult;
  canManageInvites: PermissionCheckResult;
  canManageJoinRequests: PermissionCheckResult;
  canManageScim: PermissionCheckResult;
  canManageSso: PermissionCheckResult;
  /** Whether the current user can approve/manage support sessions (workspace admins only) */
  canManageSupportSessions: PermissionCheckResult;
  canManageVerifiedDomains: PermissionCheckResult;
  canMoveProjectToWorkspace: PermissionCheckResult;
  canReadAutomateFunctions: PermissionCheckResult;
  canReadAutomateSettings: PermissionCheckResult;
  canReadBillingSettings: PermissionCheckResult;
  canReadDataResidencySettings: PermissionCheckResult;
  canReadIntegrationsSettings: PermissionCheckResult;
  canReadMemberEmail: PermissionCheckResult;
  canReadMemberRole: PermissionCheckResult;
  canReadPeopleSettings: PermissionCheckResult;
  canReadProjectsSettings: PermissionCheckResult;
  canReadSecuritySettings: PermissionCheckResult;
  /** Whether the current user can read/list support sessions for this workspace */
  canReadSupportSessions: PermissionCheckResult;
  canReadWorkspaceIssueLabels: PermissionCheckResult;
  canReadWorkspaceProjectLabels: PermissionCheckResult;
  canRejectJoinRequest: PermissionCheckResult;
  canRemoveUser: PermissionCheckResult;
  /** Whether the current user can request support access to this workspace (server admins only) */
  canRequestSupportAccess: PermissionCheckResult;
  canResendInvite: PermissionCheckResult;
  canSendJoinRequest: PermissionCheckResult;
  canUpdate: PermissionCheckResult;
  canUpdateRole: PermissionCheckResult;
  canUpgradePlan: PermissionCheckResult;
  canUseExperimentalDashboardFeatures: PermissionCheckResult;
  canUseInvite: PermissionCheckResult;
  canUsePowerTools: PermissionCheckResult;
};


export type WorkspacePermissionCheckscanChangeSeatTypeArgs = {
  targetSeatType: WorkspaceSeatType;
  targetUserId: Scalars['String']['input'];
};


export type WorkspacePermissionCheckscanDeleteSsoSessionArgs = {
  targetUserId?: InputMaybe<Scalars['String']['input']>;
};


export type WorkspacePermissionCheckscanMoveProjectToWorkspaceArgs = {
  projectId?: InputMaybe<Scalars['String']['input']>;
};


export type WorkspacePermissionCheckscanUpdateRoleArgs = {
  targetRole: WorkspaceRole;
  targetUserId: Scalars['String']['input'];
};


export type WorkspacePermissionCheckscanUpgradePlanArgs = {
  input: CanUpgradePlanInput;
};


export type WorkspacePermissionCheckscanUseInviteArgs = {
  type?: InputMaybe<InviteUseType>;
};

export type WorkspacePlan = {
  __typename?: 'WorkspacePlan';
  createdAt: Scalars['DateTime']['output'];
  /**
   * All of the enabled features for this workspace plan. Includes Core features and extra
   * features granted via feature grants.
   */
  features: Array<WorkspaceFeatureName>;
  /**
   * Just the overrides as a WorkspaceLimits TS type object.
   * Typed as JSONObject to differentiate between null/undefined
   */
  limitOverrides: Maybe<Scalars['JSONObject']['output']>;
  limits: WorkspaceLimits;
  name: WorkspacePlans;
  paymentMethod: WorkspacePaymentMethod;
  status: WorkspacePlanStatuses;
  usage: WorkspacePlanUsage;
  /** Set when status is Trial. Indicates when the trial expires. */
  validUntil: Maybe<Scalars['DateTime']['output']>;
};

export type WorkspacePlanPrice = {
  __typename?: 'WorkspacePlanPrice';
  monthly: Price;
  yearly: Price;
};

export enum WorkspacePlanStatuses {
  cancelationScheduled = 'cancelationScheduled',
  canceled = 'canceled',
  paymentFailed = 'paymentFailed',
  paymentRequired = 'paymentRequired',
  trial = 'trial',
  valid = 'valid'
}

export type WorkspacePlanUsage = {
  __typename?: 'WorkspacePlanUsage';
  dashboardCount: Scalars['Int']['output'];
  projectCount: Scalars['Int']['output'];
  sync: WorkspaceSyncUsage;
  users: WorkspaceUserCount;
  versions: WorkspaceVersionCount;
};

export type WorkspacePlanUsageSubscriptionInput = {
  workspaceId: Scalars['ID']['input'];
};

export enum WorkspacePlans {
  academia = 'academia',
  business = 'business',
  enterprise = 'enterprise',
  free = 'free',
  legacy = 'legacy',
  unlimited = 'unlimited'
}

export type WorkspaceProjectActivityTimelineInput = {
  /**
   * Opaque cursor from a previous response. When provided, withProjectRoleOnly and projectLimit are ignored.
   * Encodes the locked-in project set and next date boundary.
   */
  cursor?: InputMaybe<Scalars['String']['input']>;
  /**
   * Size of each date window in days. Default: 7.
   * Used for both discovery (now - N days) and pagination (cursor.before - N days).
   * Can change between pages — the cursor locks the project set and boundary,
   * while this controls how far back from that boundary to look.
   */
  dateRangeDays?: InputMaybe<Scalars['Int']['input']>;
  /** Max projects to discover by updatedAt DESC. Default: 20. Ignored when cursor is provided. */
  projectLimit?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Only return projects where the active user has an explicit project role.
   * Used on first call (discovery). Ignored when cursor is provided (as projects are pre-determined then).
   */
  withProjectRoleOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type WorkspaceProjectActivityTimelineProjectGroup = {
  __typename?: 'WorkspaceProjectActivityTimelineProjectGroup';
  project: Project;
  /** Versions within the date range, ordered by createdAt DESC. */
  versions: Array<Version>;
};

export type WorkspaceProjectActivityTimelineResult = {
  __typename?: 'WorkspaceProjectActivityTimelineResult';
  /** Opaque cursor for loading older data. Null when no more data is available. */
  cursor: Maybe<Scalars['String']['output']>;
  /** Projects with their versions, ordered by most recent version DESC. */
  projectGroups: Array<WorkspaceProjectActivityTimelineProjectGroup>;
};

export type WorkspaceProjectCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<ProjectVisibility>;
  workspaceId: Scalars['String']['input'];
};

export type WorkspaceProjectInviteCreateInput = {
  /** Either this or userId must be filled */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Defaults to the contributor role, if not specified */
  role?: InputMaybe<Scalars['String']['input']>;
  /**
   * The workspace seat type to assign to the user upon accepting the invite
   * (if user is a workspace member already, the seat type will be updated)
   */
  seatType?: InputMaybe<WorkspaceSeatType>;
  /** Can only be specified if guest mode is on or if the user is an admin */
  serverRole?: InputMaybe<Scalars['String']['input']>;
  /** Either this or email must be filled */
  userId?: InputMaybe<Scalars['String']['input']>;
  /** Only taken into account, if project belongs to a workspace. Defaults to guest access. */
  workspaceRole?: InputMaybe<Scalars['String']['input']>;
};

export type WorkspaceProjectLabel = {
  __typename?: 'WorkspaceProjectLabel';
  /** Child labels belonging to this group */
  children: Array<WorkspaceProjectLabel>;
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  /** Null when this row is a group (no color) */
  hexColor: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastUsedAt: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  /** Parent group label, null for top-level labels and groups */
  parent: Maybe<WorkspaceProjectLabel>;
  updatedAt: Scalars['DateTime']['output'];
};

export type WorkspaceProjectLabelCollection = {
  __typename?: 'WorkspaceProjectLabelCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<WorkspaceProjectLabel>;
  totalCount: Scalars['Int']['output'];
};

export type WorkspaceProjectLabelMutations = {
  __typename?: 'WorkspaceProjectLabelMutations';
  createProjectLabel: WorkspaceProjectLabel;
  deleteProjectLabel: Scalars['Boolean']['output'];
  updateProjectLabel: WorkspaceProjectLabel;
};


export type WorkspaceProjectLabelMutationscreateProjectLabelArgs = {
  input: CreateProjectLabelInput;
};


export type WorkspaceProjectLabelMutationsdeleteProjectLabelArgs = {
  input: DeleteProjectLabelInput;
};


export type WorkspaceProjectLabelMutationsupdateProjectLabelArgs = {
  input: UpdateProjectLabelInput;
};

export enum WorkspaceProjectLabelSortBy {
  lastUsedAt = 'lastUsedAt',
  name = 'name'
}

export type WorkspaceProjectLabelsInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  /**
   * Maximum 100
   * Default: 25
   */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Filter by name */
  search?: InputMaybe<Scalars['String']['input']>;
  /**
   * Specify the field to sort by.
   * Default: lastUsedAt
   */
  sortBy?: InputMaybe<WorkspaceProjectLabelSortBy>;
  /**
   * Specify the sort direction.
   * Default: desc
   */
  sortDirection?: InputMaybe<SortOrder>;
};

export type WorkspaceProjectMutations = {
  __typename?: 'WorkspaceProjectMutations';
  create: Project;
  /**
   * Schedule a job that will:
   * - Move all regional data to target region
   * - Update project region key
   * - TODO: Eventually delete data in previous region
   */
  moveToRegion: Scalars['String']['output'];
  moveToWorkspace: Project;
  updateRole: Project;
};


export type WorkspaceProjectMutationscreateArgs = {
  input: WorkspaceProjectCreateInput;
};


export type WorkspaceProjectMutationsmoveToRegionArgs = {
  projectId: Scalars['String']['input'];
  regionKey: Scalars['String']['input'];
};


export type WorkspaceProjectMutationsmoveToWorkspaceArgs = {
  projectId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type WorkspaceProjectMutationsupdateRoleArgs = {
  input: ProjectUpdateRoleInput;
};

export type WorkspaceProjectsFilter = {
  /** Include archived projects in results. Only respected for workspace admins; silently ignored for non-admins. */
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter projects by label ids (OR logic — returns projects that have any of the given labels) */
  labelIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Filter out projects by name */
  search?: InputMaybe<Scalars['String']['input']>;
  /** Only return workspace projects that the active user has an explicit project role in */
  withProjectRoleOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type WorkspaceProjectsUpdatedMessage = {
  __typename?: 'WorkspaceProjectsUpdatedMessage';
  /** Project entity, null if project was deleted */
  project: Maybe<Project>;
  /** Project ID */
  projectId: Scalars['String']['output'];
  /** Message type */
  type: WorkspaceProjectsUpdatedMessageType;
  /** Workspace ID */
  workspaceId: Scalars['String']['output'];
};

export enum WorkspaceProjectsUpdatedMessageType {
  ADDED = 'ADDED',
  REMOVED = 'REMOVED'
}

export type WorkspaceRequestToJoinInput = {
  workspaceId: Scalars['ID']['input'];
};

export enum WorkspaceRole {
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
  MEMBER = 'MEMBER'
}

export type WorkspaceRoleCollection = {
  __typename?: 'WorkspaceRoleCollection';
  totalCount: Scalars['Int']['output'];
};

export type WorkspaceRoleDeleteInput = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type WorkspaceRoleUpdateInput = {
  /** Leave role null to revoke access entirely */
  role?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type WorkspaceScimConfig = {
  __typename?: 'WorkspaceScimConfig';
  baseUrl: Scalars['String']['output'];
  provisionedUserCount: Scalars['Int']['output'];
  tokenCreatedAt: Scalars['DateTime']['output'];
  tokenLastUsedAt: Maybe<Scalars['DateTime']['output']>;
};

export type WorkspaceScimTokenResult = {
  __typename?: 'WorkspaceScimTokenResult';
  config: WorkspaceScimConfig;
  token: Scalars['String']['output'];
};

export type WorkspaceSeatCollection = {
  __typename?: 'WorkspaceSeatCollection';
  totalCount: Scalars['Int']['output'];
};

export enum WorkspaceSeatType {
  editor = 'editor',
  viewer = 'viewer'
}

export type WorkspaceSeatsByType = {
  __typename?: 'WorkspaceSeatsByType';
  editors: Maybe<WorkspaceSeatCollection>;
  viewers: Maybe<WorkspaceSeatCollection>;
};

export type WorkspaceShareTokensFilter = {
  createdByUserId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  sourceType?: InputMaybe<ShareSourceType>;
};

export type WorkspaceSso = {
  __typename?: 'WorkspaceSso';
  /** If null, the workspace does not have SSO configured */
  provider: Maybe<WorkspaceSsoProvider>;
  session: Maybe<WorkspaceSsoSession>;
};

export type WorkspaceSsoProvider = {
  __typename?: 'WorkspaceSsoProvider';
  clientId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  issuerUrl: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type WorkspaceSsoProviderUpdateInput = {
  clientId: Scalars['ID']['input'];
  clientSecret: Scalars['String']['input'];
  issuerUrl: Scalars['String']['input'];
  providerId: Scalars['ID']['input'];
  providerName: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type WorkspaceSsoSession = {
  __typename?: 'WorkspaceSsoSession';
  createdAt: Scalars['DateTime']['output'];
  validUntil: Scalars['DateTime']['output'];
};

export type WorkspaceSubscription = {
  __typename?: 'WorkspaceSubscription';
  addOn: WorkspaceSubscriptionAddOn;
  billingInterval: BillingInterval;
  createdAt: Scalars['DateTime']['output'];
  currency: Currency;
  currentBillingCycleEnd: Scalars['DateTime']['output'];
  seats: WorkspaceSubscriptionSeats;
  updatedAt: Scalars['DateTime']['output'];
};

export type WorkspaceSubscriptionAddOn = {
  __typename?: 'WorkspaceSubscriptionAddOn';
  /**
   * Total number of add-on packs currently purchased for the workspace (0 if none).
   * Each pack grants a fixed amount of extra projects and versions.
   */
  currentQuantity: Scalars['Int']['output'];
};

export type WorkspaceSubscriptionSeatCount = {
  __typename?: 'WorkspaceSubscriptionSeatCount';
  /** Total number of seats in use by workspace users */
  assigned: Scalars['Int']['output'];
  /** Total number of seats purchased and available in the current subscription cycle */
  available: Scalars['Int']['output'];
};

export type WorkspaceSubscriptionSeats = {
  __typename?: 'WorkspaceSubscriptionSeats';
  editors: WorkspaceSubscriptionSeatCount;
  viewers: WorkspaceSubscriptionSeatCount;
};

export type WorkspaceSupportMutations = {
  __typename?: 'WorkspaceSupportMutations';
  /**
   * Approve a pending support access request. Only workspace admins can approve.
   * Activates the session and notifies the requesting server admin.
   */
  approveAccess: WorkspaceSupportSession;
  /**
   * Request access to a workspace for support purposes. Only server admins can request access.
   * Creates a pending session and notifies workspace admins for approval.
   */
  requestAccess: WorkspaceSupportSession;
  /**
   * Revoke/stop support access. Works on both pending (denial) and active (revocation) sessions.
   * Can be called by the requesting server admin or a workspace admin.
   */
  revokeAccess: WorkspaceSupportSession;
};


export type WorkspaceSupportMutationsapproveAccessArgs = {
  input: ApproveWorkspaceSupportAccessInput;
};


export type WorkspaceSupportMutationsrequestAccessArgs = {
  input: RequestWorkspaceSupportAccessInput;
};


export type WorkspaceSupportMutationsrevokeAccessArgs = {
  input: RevokeWorkspaceSupportAccessInput;
};

/**
 * A support session grants a server admin temporary access to a workspace for support purposes.
 * Sessions are requested by server admins and must be approved by workspace admins.
 * The session is tied to the admin user (not a specific token), so any auth token the admin
 * uses will have support access for the workspace while the session is active.
 */
export type WorkspaceSupportSession = {
  __typename?: 'WorkspaceSupportSession';
  /** The server admin who requested/holds this support session */
  adminUser: LimitedUser;
  /** When the session was approved by a workspace admin. Null if still pending. */
  approvedAt: Maybe<Scalars['DateTime']['output']>;
  /** The workspace admin who approved the session. Null if still pending. */
  approvedBy: Maybe<LimitedUser>;
  /** When the session request was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** When the session was revoked/denied. Null if not revoked. */
  revokedAt: Maybe<Scalars['DateTime']['output']>;
  /** Current status of the session */
  status: WorkspaceSupportSessionStatus;
  /**
   * When the session expires. Null means no expiration.
   * A session with a past validUntil is considered expired regardless of stored status.
   */
  validUntil: Maybe<Scalars['DateTime']['output']>;
  /** The workspace this session grants access to */
  workspace: LimitedWorkspace;
};

export type WorkspaceSupportSessionCollection = {
  __typename?: 'WorkspaceSupportSessionCollection';
  cursor: Maybe<Scalars['String']['output']>;
  items: Array<WorkspaceSupportSession>;
  totalCount: Scalars['Int']['output'];
};

export type WorkspaceSupportSessionFilter = {
  /** Filter by session status(es). Returns all statuses if not specified. */
  status?: InputMaybe<Array<WorkspaceSupportSessionStatus>>;
};

/**
 * Support session status lifecycle:
 * pending → active → revoked/expired
 */
export enum WorkspaceSupportSessionStatus {
  /** Session has been approved and support access is active */
  active = 'active',
  /** Session has passed its validUntil timestamp */
  expired = 'expired',
  /** Session has been requested by a server admin, awaiting workspace admin approval */
  pending = 'pending',
  /** Session was manually stopped/revoked by either party (covers both denial and revocation) */
  revoked = 'revoked'
}

export type WorkspaceSupportSessionUpdatedMessage = {
  __typename?: 'WorkspaceSupportSessionUpdatedMessage';
  /** The affected support session */
  session: WorkspaceSupportSession;
  /** The type of update that occurred */
  type: WorkspaceSupportSessionUpdatedMessageType;
  /** The workspace this session belongs to */
  workspace: Workspace;
};

export enum WorkspaceSupportSessionUpdatedMessageType {
  APPROVED = 'APPROVED',
  EXPIRED = 'EXPIRED',
  REQUESTED = 'REQUESTED',
  REVOKED = 'REVOKED'
}

export type WorkspaceSyncUsage = {
  __typename?: 'WorkspaceSyncUsage';
  versionSyncsMonthly: Scalars['Int']['output'];
  versionSyncsTotal: Scalars['Int']['output'];
  versionsLoadedMonthly: Scalars['Int']['output'];
  versionsLoadedTotal: Scalars['Int']['output'];
  versionsPublishedMonthly: Scalars['Int']['output'];
  versionsPublishedTotal: Scalars['Int']['output'];
};

export type WorkspaceTeamByRole = {
  __typename?: 'WorkspaceTeamByRole';
  admins: Maybe<WorkspaceRoleCollection>;
  guests: Maybe<WorkspaceRoleCollection>;
  members: Maybe<WorkspaceRoleCollection>;
};

export type WorkspaceTeamFilter = {
  /** Limit team members to provided role(s) */
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Search for team members by name or email */
  search?: InputMaybe<Scalars['String']['input']>;
  seatType?: InputMaybe<WorkspaceSeatType>;
};

export type WorkspaceUpdateEmbedOptionsInput = {
  hideSpeckleBranding: Scalars['Boolean']['input'];
  workspaceId: Scalars['String']['input'];
};

export type WorkspaceUpdateInput = {
  defaultSeatType?: InputMaybe<WorkspaceSeatType>;
  description?: InputMaybe<Scalars['String']['input']>;
  discoverabilityAutoJoinEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  discoverabilityEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  domainBasedMembershipProtectionEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['String']['input'];
  isExclusive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Logo image as base64-encoded string */
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type WorkspaceUpdateSeatTypeInput = {
  seatType: WorkspaceSeatType;
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type WorkspaceUpdatedMessage = {
  __typename?: 'WorkspaceUpdatedMessage';
  /** Workspace ID */
  id: Scalars['String']['output'];
  /** Workspace itself */
  workspace: Workspace;
};

export type WorkspaceUserCount = {
  __typename?: 'WorkspaceUserCount';
  pendingUserCount: Scalars['Int']['output'];
  userCount: Scalars['Int']['output'];
};

export type WorkspaceVersionCount = {
  __typename?: 'WorkspaceVersionCount';
  pendingVersionCount: Scalars['Int']['output'];
  versionCount: Scalars['Int']['output'];
};

export type GetAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAccountQuery = { __typename?: 'Query', activeUser: { __typename?: 'User', id: string, name: string, email: string | null, role: string | null, verified: boolean | null, hasPendingVerification: boolean | null, isOnboardingFinished: boolean | null, permissions: { __typename?: 'RootPermissionChecks', canAccessServerAdminPanel: { __typename?: 'PermissionCheckResult', authorized: boolean, code: string, message: string }, canCreatePersonalProject: { __typename?: 'PermissionCheckResult', authorized: boolean, code: string, message: string }, canCreateWorkspace: { __typename?: 'PermissionCheckResult', authorized: boolean, code: string, message: string }, canManageServerRegions: { __typename?: 'PermissionCheckResult', authorized: boolean, code: string, message: string }, canManageServerUsers: { __typename?: 'PermissionCheckResult', authorized: boolean, code: string, message: string }, canManageServerWorkspaces: { __typename?: 'PermissionCheckResult', authorized: boolean, code: string, message: string }, canSupportServerUsers: { __typename?: 'PermissionCheckResult', authorized: boolean, code: string, message: string }, canUpdateServerSettings: { __typename?: 'PermissionCheckResult', authorized: boolean, code: string, message: string }, canUsePowerTools: { __typename?: 'PermissionCheckResult', authorized: boolean, code: string, message: string } } } | null };

export type CreateApiTokenMutationVariables = Exact<{
  token: ApiTokenCreateInput;
}>;


export type CreateApiTokenMutation = { __typename?: 'Mutation', apiTokenCreate: string };

export type RevokeApiTokenMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type RevokeApiTokenMutation = { __typename?: 'Mutation', apiTokenRevoke: boolean };

export type ListApiTokensQueryVariables = Exact<{ [key: string]: never; }>;


export type ListApiTokensQuery = { __typename?: 'Query', activeUser: { __typename?: 'User', apiTokens: Array<{ __typename?: 'ApiToken', id: string, name: string, lastUsed: string, lifespan: string, createdAt: string, scopes: Array<string | null> }> } | null };

export type CreateAutomationMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  input: ProjectAutomationCreateInput;
}>;


export type CreateAutomationMutation = { __typename?: 'Mutation', projectMutations: { __typename?: 'ProjectMutations', automationMutations: { __typename?: 'ProjectAutomationMutations', create: { __typename?: 'Automation', id: string, name: string } } } };

export type UpdateAutomationMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  input: ProjectAutomationUpdateInput;
}>;


export type UpdateAutomationMutation = { __typename?: 'Mutation', projectMutations: { __typename?: 'ProjectMutations', automationMutations: { __typename?: 'ProjectAutomationMutations', update: { __typename?: 'Automation', id: string, name: string, enabled: boolean } } } };

export type TriggerAutomationMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  automationId: Scalars['ID']['input'];
}>;


export type TriggerAutomationMutation = { __typename?: 'Mutation', projectMutations: { __typename?: 'ProjectMutations', automationMutations: { __typename?: 'ProjectAutomationMutations', trigger: string } } };

export type ListProjectAutomationsQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ListProjectAutomationsQuery = { __typename?: 'Query', project: { __typename?: 'Project', automations: { __typename?: 'AutomationCollection', totalCount: number, cursor: string | null, items: Array<{ __typename?: 'Automation', id: string, name: string, enabled: boolean, createdAt: string, updatedAt: string }> } } };

export type GetAutomationQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  automationId: Scalars['String']['input'];
}>;


export type GetAutomationQuery = { __typename?: 'Query', project: { __typename?: 'Project', automation: { __typename?: 'Automation', id: string, name: string, enabled: boolean, runs: { __typename?: 'AutomateRunCollection', items: Array<{ __typename?: 'AutomateRun', id: string, status: AutomateRunStatus, createdAt: string }> } } } };

export type OnAutomationsUpdatedSubscriptionVariables = Exact<{
  projectId: Scalars['String']['input'];
}>;


export type OnAutomationsUpdatedSubscription = { __typename?: 'Subscription', projectAutomationsUpdated: { __typename?: 'ProjectAutomationsUpdatedMessage', type: ProjectAutomationsUpdatedMessageType, automationId: string, automation: { __typename?: 'Automation', id: string, name: string, enabled: boolean } | null } };

export type OnTriggeredAutomationsStatusUpdatedSubscriptionVariables = Exact<{
  projectId: Scalars['String']['input'];
}>;


export type OnTriggeredAutomationsStatusUpdatedSubscription = { __typename?: 'Subscription', projectTriggeredAutomationsStatusUpdated: { __typename?: 'ProjectTriggeredAutomationsStatusUpdatedMessage', type: ProjectTriggeredAutomationsStatusUpdatedMessageType, version: { __typename?: 'Version', id: string }, model: { __typename?: 'Model', id: string }, project: { __typename?: 'Project', id: string } } };

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', commentMutations: { __typename?: 'CommentMutations', create: { __typename?: 'Comment', id: string, rawText: string | null, createdAt: string } } };

export type EditCommentMutationVariables = Exact<{
  input: EditCommentInput;
}>;


export type EditCommentMutation = { __typename?: 'Mutation', commentMutations: { __typename?: 'CommentMutations', edit: { __typename?: 'Comment', id: string, rawText: string | null } } };

export type ArchiveCommentMutationVariables = Exact<{
  input: ArchiveCommentInput;
}>;


export type ArchiveCommentMutation = { __typename?: 'Mutation', commentMutations: { __typename?: 'CommentMutations', archive: boolean } };

export type MarkCommentViewedMutationVariables = Exact<{
  input: MarkCommentViewedInput;
}>;


export type MarkCommentViewedMutation = { __typename?: 'Mutation', commentMutations: { __typename?: 'CommentMutations', markViewed: boolean } };

export type GetProjectCommentsQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  filter?: InputMaybe<ProjectCommentsFilter>;
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetProjectCommentsQuery = { __typename?: 'Query', project: { __typename?: 'Project', commentThreads: { __typename?: 'ProjectCommentCollection', totalCount: number, cursor: string | null, items: Array<{ __typename?: 'Comment', id: string, rawText: string | null, createdAt: string, author: { __typename?: 'LimitedUser', id: string, name: string } | null, replies: { __typename?: 'CommentCollection', totalCount: number } }> } } };

export type OnCommentActivitySubscriptionVariables = Exact<{
  target: ViewerUpdateTrackingTarget;
}>;


export type OnCommentActivitySubscription = { __typename?: 'Subscription', projectCommentsUpdated: { __typename?: 'ProjectCommentsUpdatedMessage', id: string, type: ProjectCommentsUpdatedMessageType, comment: { __typename?: 'Comment', id: string, rawText: string | null, createdAt: string } | null } };

export type StartFileImportMutationVariables = Exact<{
  input: GenerateFileUploadUrlInput;
}>;


export type StartFileImportMutation = { __typename?: 'Mutation', fileUploadMutations: { __typename?: 'FileUploadMutations', generateUploadUrl: { __typename?: 'GenerateFileUploadUrlOutput', url: string, fileId: string } } };

export type FinalizeFileImportMutationVariables = Exact<{
  input: StartFileImportInput;
}>;


export type FinalizeFileImportMutation = { __typename?: 'Mutation', fileUploadMutations: { __typename?: 'FileUploadMutations', startFileImport: { __typename?: 'FileUpload', id: string, modelName: string } } };

export type ListProjectFileImportsQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ListProjectFileImportsQuery = { __typename?: 'Query', project: { __typename?: 'Project', pendingImportedModels: Array<{ __typename?: 'FileUpload', id: string, modelName: string, convertedStatus: number, uploadDate: string }> } };

export type CreateInsightMutationVariables = Exact<{
  input: InsightCreateInput;
}>;


export type CreateInsightMutation = { __typename?: 'Mutation', insightMutations: { __typename?: 'InsightMutations', create: { __typename?: 'Insight', id: string, name: string, type: string, version: number, projectId: string, modelIds: Array<string> } } };

export type CreateInsightFromTemplateMutationVariables = Exact<{
  input: CreateFromTemplateInput;
}>;


export type CreateInsightFromTemplateMutation = { __typename?: 'Mutation', insightMutations: { __typename?: 'InsightMutations', createFromTemplate: { __typename?: 'Insight', id: string, name: string, type: string, version: number, templateVersion: number | null, projectId: string, modelIds: Array<string> } } };

export type CreateModelMutationVariables = Exact<{
  input: CreateModelInput;
}>;


export type CreateModelMutation = { __typename?: 'Mutation', modelMutations: { __typename?: 'ModelMutations', create: { __typename?: 'Model', id: string, name: string } } };

export type UpdateModelMutationVariables = Exact<{
  input: UpdateModelInput;
}>;


export type UpdateModelMutation = { __typename?: 'Mutation', modelMutations: { __typename?: 'ModelMutations', update: { __typename?: 'Model', id: string, name: string, description: string | null } } };

export type DeleteModelMutationVariables = Exact<{
  input: DeleteModelInput;
}>;


export type DeleteModelMutation = { __typename?: 'Mutation', modelMutations: { __typename?: 'ModelMutations', delete: boolean } };

export type GetModelQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  modelId: Scalars['String']['input'];
}>;


export type GetModelQuery = { __typename?: 'Query', project: { __typename?: 'Project', model: { __typename?: 'Model', id: string, name: string, description: string | null, createdAt: string, updatedAt: string } } };

export type GetModelVersionsQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  modelId: Scalars['String']['input'];
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetModelVersionsQuery = { __typename?: 'Query', project: { __typename?: 'Project', model: { __typename?: 'Model', versions: { __typename?: 'VersionCollection', totalCount: number, cursor: string | null, items: Array<{ __typename?: 'Version', id: string, message: string | null, sourceApplication: string | null, referencedObject: string | null, createdAt: string, authorUser: { __typename?: 'LimitedUser', id: string, name: string } | null }> } } } };

export type CreateProjectMutationVariables = Exact<{
  input: ProjectCreateInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', projectMutations: { __typename?: 'ProjectMutations', create: { __typename?: 'Project', id: string, name: string, visibility: ProjectVisibility } } };

export type UpdateProjectMutationVariables = Exact<{
  update: ProjectUpdateInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', projectMutations: { __typename?: 'ProjectMutations', update: { __typename?: 'Project', id: string, name: string, description: string | null, visibility: ProjectVisibility, updatedAt: string } } };

export type DeleteProjectMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteProjectMutation = { __typename?: 'Mutation', projectMutations: { __typename?: 'ProjectMutations', delete: boolean } };

export type GetProjectQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetProjectQuery = { __typename?: 'Query', project: { __typename?: 'Project', id: string, name: string, description: string | null, visibility: ProjectVisibility, role: string | null, createdAt: string, updatedAt: string, workspaceId: string | null } };

export type GetProjectModelsQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetProjectModelsQuery = { __typename?: 'Query', project: { __typename?: 'Project', models: { __typename?: 'ModelCollection', totalCount: number, cursor: string | null, items: Array<{ __typename?: 'Model', id: string, name: string, description: string | null, createdAt: string, updatedAt: string }> } } };

export type SearchProjectsQueryVariables = Exact<{
  filter?: InputMaybe<UserProjectsFilter>;
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SearchProjectsQuery = { __typename?: 'Query', activeUser: { __typename?: 'User', projects: { __typename?: 'UserProjectCollection', totalCount: number, cursor: string | null, items: Array<{ __typename?: 'Project', id: string, name: string, visibility: ProjectVisibility, role: string | null, updatedAt: string }> } } | null };

export type OnProjectUpdatedSubscriptionVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type OnProjectUpdatedSubscription = { __typename?: 'Subscription', projectUpdated: { __typename?: 'ProjectUpdatedMessage', id: string, type: ProjectUpdatedMessageType, project: { __typename?: 'Project', id: string, name: string, updatedAt: string } | null } };

export type OnProjectModelsUpdatedSubscriptionVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type OnProjectModelsUpdatedSubscription = { __typename?: 'Subscription', projectModelsUpdated: { __typename?: 'ProjectModelsUpdatedMessage', id: string, type: ProjectModelsUpdatedMessageType, model: { __typename?: 'Model', id: string, name: string, updatedAt: string } | null } };

export type OnProjectVersionsUpdatedSubscriptionVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type OnProjectVersionsUpdatedSubscription = { __typename?: 'Subscription', projectVersionsUpdated: { __typename?: 'ProjectVersionsUpdatedMessage', id: string, type: ProjectVersionsUpdatedMessageType, version: { __typename?: 'Version', id: string, message: string | null, createdAt: string } | null } };

export type OnProjectCommentsUpdatedSubscriptionVariables = Exact<{
  target: ViewerUpdateTrackingTarget;
}>;


export type OnProjectCommentsUpdatedSubscription = { __typename?: 'Subscription', projectCommentsUpdated: { __typename?: 'ProjectCommentsUpdatedMessage', id: string, type: ProjectCommentsUpdatedMessageType, comment: { __typename?: 'Comment', id: string, rawText: string | null, createdAt: string } | null } };

export type GetServerInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetServerInfoQuery = { __typename?: 'Query', serverInfo: { __typename?: 'ServerInfo', name: string, company: string | null, description: string | null, version: string | null, adminContact: string | null, canonicalUrl: string | null } };

export type UpdateActiveUserMutationVariables = Exact<{
  user: UserUpdateInput;
}>;


export type UpdateActiveUserMutation = { __typename?: 'Mutation', activeUserMutations: { __typename?: 'ActiveUserMutations', update: { __typename?: 'User', id: string, name: string, bio: string | null, company: string | null } } };

export type GetActiveUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveUserQuery = { __typename?: 'Query', activeUser: { __typename?: 'User', id: string, name: string, email: string | null, bio: string | null, company: string | null, avatar: string | null, createdAt: string | null } | null };

export type GetUserQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, name: string, bio: string | null, company: string | null, avatar: string | null, createdAt: string | null } | null };

export type SearchUsersQueryVariables = Exact<{
  query: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchUsersQuery = { __typename?: 'Query', userSearch: { __typename?: 'UserSearchResultCollection', cursor: string | null, items: Array<{ __typename?: 'LimitedUser', id: string, name: string, avatar: string | null }> } };

export type CreateVersionMutationVariables = Exact<{
  input: CreateVersionInput;
}>;


export type CreateVersionMutation = { __typename?: 'Mutation', versionMutations: { __typename?: 'VersionMutations', create: { __typename?: 'Version', id: string, message: string | null, createdAt: string } } };

export type UpdateVersionMutationVariables = Exact<{
  input: UpdateVersionInput;
}>;


export type UpdateVersionMutation = { __typename?: 'Mutation', versionMutations: { __typename?: 'VersionMutations', update: { __typename?: 'Version', id: string, message: string | null } } };

export type DeleteVersionsMutationVariables = Exact<{
  input: DeleteVersionsInput;
}>;


export type DeleteVersionsMutation = { __typename?: 'Mutation', versionMutations: { __typename?: 'VersionMutations', delete: boolean } };

export type MarkVersionReceivedMutationVariables = Exact<{
  input: MarkReceivedVersionInput;
}>;


export type MarkVersionReceivedMutation = { __typename?: 'Mutation', versionMutations: { __typename?: 'VersionMutations', markReceived: boolean } };

export type GetVersionQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  modelId: Scalars['String']['input'];
  versionId: Scalars['String']['input'];
}>;


export type GetVersionQuery = { __typename?: 'Query', project: { __typename?: 'Project', model: { __typename?: 'Model', version: { __typename?: 'Version', id: string, message: string | null, sourceApplication: string | null, referencedObject: string | null, createdAt: string, authorUser: { __typename?: 'LimitedUser', id: string, name: string } | null } } } };

export type CreateWebhookMutationVariables = Exact<{
  webhook: WebhookCreateInput;
}>;


export type CreateWebhookMutation = { __typename?: 'Mutation', webhookCreate: string };

export type UpdateWebhookMutationVariables = Exact<{
  webhook: WebhookUpdateInput;
}>;


export type UpdateWebhookMutation = { __typename?: 'Mutation', webhookUpdate: string };

export type DeleteWebhookMutationVariables = Exact<{
  webhook: WebhookDeleteInput;
}>;


export type DeleteWebhookMutation = { __typename?: 'Mutation', webhookDelete: string };

export type ListWebhooksQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
}>;


export type ListWebhooksQuery = { __typename?: 'Query', project: { __typename?: 'Project', webhooks: { __typename?: 'WebhookCollection', totalCount: number, items: Array<{ __typename?: 'Webhook', id: string, url: string, triggers: Array<string>, enabled: boolean | null, description: string | null }> } } };

export type CreateWorkspaceMutationVariables = Exact<{
  input: WorkspaceCreateInput;
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', workspaceMutations: { __typename?: 'WorkspaceMutations', create: { __typename?: 'Workspace', id: string, name: string, slug: string } } };

export type UpdateWorkspaceMutationVariables = Exact<{
  input: WorkspaceUpdateInput;
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', workspaceMutations: { __typename?: 'WorkspaceMutations', update: { __typename?: 'Workspace', id: string, name: string, description: string | null } } };

export type InviteToWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  input: WorkspaceInviteCreateInput;
}>;


export type InviteToWorkspaceMutation = { __typename?: 'Mutation', workspaceMutations: { __typename?: 'WorkspaceMutations', invites: { __typename?: 'WorkspaceInviteMutations', create: { __typename?: 'Workspace', id: string } } } };

export type CreateWorkspaceProjectMutationVariables = Exact<{
  input: WorkspaceProjectCreateInput;
}>;


export type CreateWorkspaceProjectMutation = { __typename?: 'Mutation', workspaceMutations: { __typename?: 'WorkspaceMutations', projects: { __typename?: 'WorkspaceProjectMutations', create: { __typename?: 'Project', id: string, name: string, visibility: ProjectVisibility, workspaceId: string | null } } } };

export type GetWorkspaceQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetWorkspaceQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', id: string, name: string, slug: string, description: string | null, createdAt: string } };

export type ListWorkspacesQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ListWorkspacesQuery = { __typename?: 'Query', activeUser: { __typename?: 'User', workspaces: { __typename?: 'WorkspaceCollection', totalCount: number, cursor: string | null, items: Array<{ __typename?: 'Workspace', id: string, name: string, slug: string, description: string | null }> } } | null };

export type OnWorkspaceUpdatedSubscriptionVariables = Exact<{
  workspaceId?: InputMaybe<Scalars['String']['input']>;
  workspaceSlug?: InputMaybe<Scalars['String']['input']>;
}>;


export type OnWorkspaceUpdatedSubscription = { __typename?: 'Subscription', workspaceUpdated: { __typename?: 'WorkspaceUpdatedMessage', id: string, workspace: { __typename?: 'Workspace', id: string, name: string } } };


export const GetAccountDocument = `
    query GetAccount {
  activeUser {
    id
    name
    email
    role
    verified
    hasPendingVerification
    isOnboardingFinished
    permissions {
      canAccessServerAdminPanel {
        authorized
        code
        message
      }
      canCreatePersonalProject {
        authorized
        code
        message
      }
      canCreateWorkspace {
        authorized
        code
        message
      }
      canManageServerRegions {
        authorized
        code
        message
      }
      canManageServerUsers {
        authorized
        code
        message
      }
      canManageServerWorkspaces {
        authorized
        code
        message
      }
      canSupportServerUsers {
        authorized
        code
        message
      }
      canUpdateServerSettings {
        authorized
        code
        message
      }
      canUsePowerTools {
        authorized
        code
        message
      }
    }
  }
}
    `;
export const CreateApiTokenDocument = `
    mutation CreateApiToken($token: ApiTokenCreateInput!) {
  apiTokenCreate(token: $token)
}
    `;
export const RevokeApiTokenDocument = `
    mutation RevokeApiToken($token: String!) {
  apiTokenRevoke(token: $token)
}
    `;
export const ListApiTokensDocument = `
    query ListApiTokens {
  activeUser {
    apiTokens {
      id
      name
      lastUsed
      lifespan
      createdAt
      scopes
    }
  }
}
    `;
export const CreateAutomationDocument = `
    mutation CreateAutomation($projectId: ID!, $input: ProjectAutomationCreateInput!) {
  projectMutations {
    automationMutations(projectId: $projectId) {
      create(input: $input) {
        id
        name
      }
    }
  }
}
    `;
export const UpdateAutomationDocument = `
    mutation UpdateAutomation($projectId: ID!, $input: ProjectAutomationUpdateInput!) {
  projectMutations {
    automationMutations(projectId: $projectId) {
      update(input: $input) {
        id
        name
        enabled
      }
    }
  }
}
    `;
export const TriggerAutomationDocument = `
    mutation TriggerAutomation($projectId: ID!, $automationId: ID!) {
  projectMutations {
    automationMutations(projectId: $projectId) {
      trigger(automationId: $automationId)
    }
  }
}
    `;
export const ListProjectAutomationsDocument = `
    query ListProjectAutomations($projectId: String!, $cursor: String, $limit: Int) {
  project(id: $projectId) {
    automations(cursor: $cursor, limit: $limit) {
      totalCount
      cursor
      items {
        id
        name
        enabled
        createdAt
        updatedAt
      }
    }
  }
}
    `;
export const GetAutomationDocument = `
    query GetAutomation($projectId: String!, $automationId: String!) {
  project(id: $projectId) {
    automation(id: $automationId) {
      id
      name
      enabled
      runs {
        items {
          id
          status
          createdAt
        }
      }
    }
  }
}
    `;
export const OnAutomationsUpdatedDocument = `
    subscription OnAutomationsUpdated($projectId: String!) {
  projectAutomationsUpdated(projectId: $projectId) {
    type
    automationId
    automation {
      id
      name
      enabled
    }
  }
}
    `;
export const OnTriggeredAutomationsStatusUpdatedDocument = `
    subscription OnTriggeredAutomationsStatusUpdated($projectId: String!) {
  projectTriggeredAutomationsStatusUpdated(projectId: $projectId) {
    type
    version {
      id
    }
    model {
      id
    }
    project {
      id
    }
  }
}
    `;
export const CreateCommentDocument = `
    mutation CreateComment($input: CreateCommentInput!) {
  commentMutations {
    create(input: $input) {
      id
      rawText
      createdAt
    }
  }
}
    `;
export const EditCommentDocument = `
    mutation EditComment($input: EditCommentInput!) {
  commentMutations {
    edit(input: $input) {
      id
      rawText
    }
  }
}
    `;
export const ArchiveCommentDocument = `
    mutation ArchiveComment($input: ArchiveCommentInput!) {
  commentMutations {
    archive(input: $input)
  }
}
    `;
export const MarkCommentViewedDocument = `
    mutation MarkCommentViewed($input: MarkCommentViewedInput!) {
  commentMutations {
    markViewed(input: $input)
  }
}
    `;
export const GetProjectCommentsDocument = `
    query GetProjectComments($projectId: String!, $filter: ProjectCommentsFilter, $cursor: String, $limit: Int) {
  project(id: $projectId) {
    commentThreads(filter: $filter, cursor: $cursor, limit: $limit) {
      totalCount
      cursor
      items {
        id
        rawText
        createdAt
        author {
          id
          name
        }
        replies {
          totalCount
        }
      }
    }
  }
}
    `;
export const OnCommentActivityDocument = `
    subscription OnCommentActivity($target: ViewerUpdateTrackingTarget!) {
  projectCommentsUpdated(target: $target) {
    id
    type
    comment {
      id
      rawText
      createdAt
    }
  }
}
    `;
export const StartFileImportDocument = `
    mutation StartFileImport($input: GenerateFileUploadUrlInput!) {
  fileUploadMutations {
    generateUploadUrl(input: $input) {
      url
      fileId
    }
  }
}
    `;
export const FinalizeFileImportDocument = `
    mutation FinalizeFileImport($input: StartFileImportInput!) {
  fileUploadMutations {
    startFileImport(input: $input) {
      id
      modelName
    }
  }
}
    `;
export const ListProjectFileImportsDocument = `
    query ListProjectFileImports($projectId: String!, $cursor: String, $limit: Int) {
  project(id: $projectId) {
    pendingImportedModels {
      id
      modelName
      convertedStatus
      uploadDate
    }
  }
}
    `;
export const CreateInsightDocument = `
    mutation CreateInsight($input: InsightCreateInput!) {
  insightMutations {
    create(input: $input) {
      id
      name
      type
      version
      projectId
      modelIds
    }
  }
}
    `;
export const CreateInsightFromTemplateDocument = `
    mutation CreateInsightFromTemplate($input: CreateFromTemplateInput!) {
  insightMutations {
    createFromTemplate(input: $input) {
      id
      name
      type
      version
      templateVersion
      projectId
      modelIds
    }
  }
}
    `;
export const CreateModelDocument = `
    mutation CreateModel($input: CreateModelInput!) {
  modelMutations {
    create(input: $input) {
      id
      name
    }
  }
}
    `;
export const UpdateModelDocument = `
    mutation UpdateModel($input: UpdateModelInput!) {
  modelMutations {
    update(input: $input) {
      id
      name
      description
    }
  }
}
    `;
export const DeleteModelDocument = `
    mutation DeleteModel($input: DeleteModelInput!) {
  modelMutations {
    delete(input: $input)
  }
}
    `;
export const GetModelDocument = `
    query GetModel($projectId: String!, $modelId: String!) {
  project(id: $projectId) {
    model(id: $modelId) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
}
    `;
export const GetModelVersionsDocument = `
    query GetModelVersions($projectId: String!, $modelId: String!, $cursor: String, $limit: Int) {
  project(id: $projectId) {
    model(id: $modelId) {
      versions(cursor: $cursor, limit: $limit) {
        totalCount
        cursor
        items {
          id
          message
          sourceApplication
          referencedObject
          createdAt
          authorUser {
            id
            name
          }
        }
      }
    }
  }
}
    `;
export const CreateProjectDocument = `
    mutation CreateProject($input: ProjectCreateInput!) {
  projectMutations {
    create(input: $input) {
      id
      name
      visibility
    }
  }
}
    `;
export const UpdateProjectDocument = `
    mutation UpdateProject($update: ProjectUpdateInput!) {
  projectMutations {
    update(update: $update) {
      id
      name
      description
      visibility
      updatedAt
    }
  }
}
    `;
export const DeleteProjectDocument = `
    mutation DeleteProject($id: String!) {
  projectMutations {
    delete(id: $id)
  }
}
    `;
export const GetProjectDocument = `
    query GetProject($id: String!) {
  project(id: $id) {
    id
    name
    description
    visibility
    role
    createdAt
    updatedAt
    workspaceId
  }
}
    `;
export const GetProjectModelsDocument = `
    query GetProjectModels($projectId: String!, $cursor: String, $limit: Int) {
  project(id: $projectId) {
    models(cursor: $cursor, limit: $limit) {
      totalCount
      cursor
      items {
        id
        name
        description
        createdAt
        updatedAt
      }
    }
  }
}
    `;
export const SearchProjectsDocument = `
    query SearchProjects($filter: UserProjectsFilter, $cursor: String, $limit: Int) {
  activeUser {
    projects(filter: $filter, cursor: $cursor, limit: $limit) {
      totalCount
      cursor
      items {
        id
        name
        visibility
        role
        updatedAt
      }
    }
  }
}
    `;
export const OnProjectUpdatedDocument = `
    subscription OnProjectUpdated($id: String!) {
  projectUpdated(id: $id) {
    id
    type
    project {
      id
      name
      updatedAt
    }
  }
}
    `;
export const OnProjectModelsUpdatedDocument = `
    subscription OnProjectModelsUpdated($id: String!) {
  projectModelsUpdated(id: $id) {
    id
    type
    model {
      id
      name
      updatedAt
    }
  }
}
    `;
export const OnProjectVersionsUpdatedDocument = `
    subscription OnProjectVersionsUpdated($id: String!) {
  projectVersionsUpdated(id: $id) {
    id
    type
    version {
      id
      message
      createdAt
    }
  }
}
    `;
export const OnProjectCommentsUpdatedDocument = `
    subscription OnProjectCommentsUpdated($target: ViewerUpdateTrackingTarget!) {
  projectCommentsUpdated(target: $target) {
    id
    type
    comment {
      id
      rawText
      createdAt
    }
  }
}
    `;
export const GetServerInfoDocument = `
    query GetServerInfo {
  serverInfo {
    name
    company
    description
    version
    adminContact
    canonicalUrl
  }
}
    `;
export const UpdateActiveUserDocument = `
    mutation UpdateActiveUser($user: UserUpdateInput!) {
  activeUserMutations {
    update(user: $user) {
      id
      name
      bio
      company
    }
  }
}
    `;
export const GetActiveUserDocument = `
    query GetActiveUser {
  activeUser {
    id
    name
    email
    bio
    company
    avatar
    createdAt
  }
}
    `;
export const GetUserDocument = `
    query GetUser($id: String!) {
  user(id: $id) {
    id
    name
    bio
    company
    avatar
    createdAt
  }
}
    `;
export const SearchUsersDocument = `
    query SearchUsers($query: String!, $limit: Int, $cursor: String) {
  userSearch(query: $query, limit: $limit, cursor: $cursor) {
    cursor
    items {
      id
      name
      avatar
    }
  }
}
    `;
export const CreateVersionDocument = `
    mutation CreateVersion($input: CreateVersionInput!) {
  versionMutations {
    create(input: $input) {
      id
      message
      createdAt
    }
  }
}
    `;
export const UpdateVersionDocument = `
    mutation UpdateVersion($input: UpdateVersionInput!) {
  versionMutations {
    update(input: $input) {
      id
      message
    }
  }
}
    `;
export const DeleteVersionsDocument = `
    mutation DeleteVersions($input: DeleteVersionsInput!) {
  versionMutations {
    delete(input: $input)
  }
}
    `;
export const MarkVersionReceivedDocument = `
    mutation MarkVersionReceived($input: MarkReceivedVersionInput!) {
  versionMutations {
    markReceived(input: $input)
  }
}
    `;
export const GetVersionDocument = `
    query GetVersion($projectId: String!, $modelId: String!, $versionId: String!) {
  project(id: $projectId) {
    model(id: $modelId) {
      version(id: $versionId) {
        id
        message
        sourceApplication
        referencedObject
        createdAt
        authorUser {
          id
          name
        }
      }
    }
  }
}
    `;
export const CreateWebhookDocument = `
    mutation CreateWebhook($webhook: WebhookCreateInput!) {
  webhookCreate(webhook: $webhook)
}
    `;
export const UpdateWebhookDocument = `
    mutation UpdateWebhook($webhook: WebhookUpdateInput!) {
  webhookUpdate(webhook: $webhook)
}
    `;
export const DeleteWebhookDocument = `
    mutation DeleteWebhook($webhook: WebhookDeleteInput!) {
  webhookDelete(webhook: $webhook)
}
    `;
export const ListWebhooksDocument = `
    query ListWebhooks($projectId: String!) {
  project(id: $projectId) {
    webhooks {
      totalCount
      items {
        id
        url
        triggers
        enabled
        description
      }
    }
  }
}
    `;
export const CreateWorkspaceDocument = `
    mutation CreateWorkspace($input: WorkspaceCreateInput!) {
  workspaceMutations {
    create(input: $input) {
      id
      name
      slug
    }
  }
}
    `;
export const UpdateWorkspaceDocument = `
    mutation UpdateWorkspace($input: WorkspaceUpdateInput!) {
  workspaceMutations {
    update(input: $input) {
      id
      name
      description
    }
  }
}
    `;
export const InviteToWorkspaceDocument = `
    mutation InviteToWorkspace($workspaceId: String!, $input: WorkspaceInviteCreateInput!) {
  workspaceMutations {
    invites {
      create(workspaceId: $workspaceId, input: $input) {
        id
      }
    }
  }
}
    `;
export const CreateWorkspaceProjectDocument = `
    mutation CreateWorkspaceProject($input: WorkspaceProjectCreateInput!) {
  workspaceMutations {
    projects {
      create(input: $input) {
        id
        name
        visibility
        workspaceId
      }
    }
  }
}
    `;
export const GetWorkspaceDocument = `
    query GetWorkspace($id: String!) {
  workspace(id: $id) {
    id
    name
    slug
    description
    createdAt
  }
}
    `;
export const ListWorkspacesDocument = `
    query ListWorkspaces($cursor: String, $limit: Int) {
  activeUser {
    workspaces(cursor: $cursor, limit: $limit) {
      totalCount
      cursor
      items {
        id
        name
        slug
        description
      }
    }
  }
}
    `;
export const OnWorkspaceUpdatedDocument = `
    subscription OnWorkspaceUpdated($workspaceId: String, $workspaceSlug: String) {
  workspaceUpdated(workspaceId: $workspaceId, workspaceSlug: $workspaceSlug) {
    id
    workspace {
      id
      name
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    GetAccount(variables?: GetAccountQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetAccountQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAccountQuery>({ document: GetAccountDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAccount', 'query', variables);
    },
    CreateApiToken(variables: CreateApiTokenMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateApiTokenMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateApiTokenMutation>({ document: CreateApiTokenDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateApiToken', 'mutation', variables);
    },
    RevokeApiToken(variables: RevokeApiTokenMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RevokeApiTokenMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RevokeApiTokenMutation>({ document: RevokeApiTokenDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RevokeApiToken', 'mutation', variables);
    },
    ListApiTokens(variables?: ListApiTokensQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ListApiTokensQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ListApiTokensQuery>({ document: ListApiTokensDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ListApiTokens', 'query', variables);
    },
    CreateAutomation(variables: CreateAutomationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateAutomationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateAutomationMutation>({ document: CreateAutomationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateAutomation', 'mutation', variables);
    },
    UpdateAutomation(variables: UpdateAutomationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateAutomationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateAutomationMutation>({ document: UpdateAutomationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateAutomation', 'mutation', variables);
    },
    TriggerAutomation(variables: TriggerAutomationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<TriggerAutomationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<TriggerAutomationMutation>({ document: TriggerAutomationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'TriggerAutomation', 'mutation', variables);
    },
    ListProjectAutomations(variables: ListProjectAutomationsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ListProjectAutomationsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ListProjectAutomationsQuery>({ document: ListProjectAutomationsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ListProjectAutomations', 'query', variables);
    },
    GetAutomation(variables: GetAutomationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetAutomationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAutomationQuery>({ document: GetAutomationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAutomation', 'query', variables);
    },
    OnAutomationsUpdated(variables: OnAutomationsUpdatedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<OnAutomationsUpdatedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<OnAutomationsUpdatedSubscription>({ document: OnAutomationsUpdatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'OnAutomationsUpdated', 'subscription', variables);
    },
    OnTriggeredAutomationsStatusUpdated(variables: OnTriggeredAutomationsStatusUpdatedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<OnTriggeredAutomationsStatusUpdatedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<OnTriggeredAutomationsStatusUpdatedSubscription>({ document: OnTriggeredAutomationsStatusUpdatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'OnTriggeredAutomationsStatusUpdated', 'subscription', variables);
    },
    CreateComment(variables: CreateCommentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateCommentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateCommentMutation>({ document: CreateCommentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateComment', 'mutation', variables);
    },
    EditComment(variables: EditCommentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<EditCommentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<EditCommentMutation>({ document: EditCommentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'EditComment', 'mutation', variables);
    },
    ArchiveComment(variables: ArchiveCommentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ArchiveCommentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ArchiveCommentMutation>({ document: ArchiveCommentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ArchiveComment', 'mutation', variables);
    },
    MarkCommentViewed(variables: MarkCommentViewedMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<MarkCommentViewedMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<MarkCommentViewedMutation>({ document: MarkCommentViewedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'MarkCommentViewed', 'mutation', variables);
    },
    GetProjectComments(variables: GetProjectCommentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetProjectCommentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProjectCommentsQuery>({ document: GetProjectCommentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetProjectComments', 'query', variables);
    },
    OnCommentActivity(variables: OnCommentActivitySubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<OnCommentActivitySubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<OnCommentActivitySubscription>({ document: OnCommentActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'OnCommentActivity', 'subscription', variables);
    },
    StartFileImport(variables: StartFileImportMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<StartFileImportMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<StartFileImportMutation>({ document: StartFileImportDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'StartFileImport', 'mutation', variables);
    },
    FinalizeFileImport(variables: FinalizeFileImportMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FinalizeFileImportMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<FinalizeFileImportMutation>({ document: FinalizeFileImportDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FinalizeFileImport', 'mutation', variables);
    },
    ListProjectFileImports(variables: ListProjectFileImportsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ListProjectFileImportsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ListProjectFileImportsQuery>({ document: ListProjectFileImportsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ListProjectFileImports', 'query', variables);
    },
    CreateInsight(variables: CreateInsightMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateInsightMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateInsightMutation>({ document: CreateInsightDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateInsight', 'mutation', variables);
    },
    CreateInsightFromTemplate(variables: CreateInsightFromTemplateMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateInsightFromTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateInsightFromTemplateMutation>({ document: CreateInsightFromTemplateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateInsightFromTemplate', 'mutation', variables);
    },
    CreateModel(variables: CreateModelMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateModelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateModelMutation>({ document: CreateModelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateModel', 'mutation', variables);
    },
    UpdateModel(variables: UpdateModelMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateModelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateModelMutation>({ document: UpdateModelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateModel', 'mutation', variables);
    },
    DeleteModel(variables: DeleteModelMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteModelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteModelMutation>({ document: DeleteModelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteModel', 'mutation', variables);
    },
    GetModel(variables: GetModelQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetModelQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetModelQuery>({ document: GetModelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetModel', 'query', variables);
    },
    GetModelVersions(variables: GetModelVersionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetModelVersionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetModelVersionsQuery>({ document: GetModelVersionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetModelVersions', 'query', variables);
    },
    CreateProject(variables: CreateProjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateProjectMutation>({ document: CreateProjectDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateProject', 'mutation', variables);
    },
    UpdateProject(variables: UpdateProjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateProjectMutation>({ document: UpdateProjectDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateProject', 'mutation', variables);
    },
    DeleteProject(variables: DeleteProjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteProjectMutation>({ document: DeleteProjectDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteProject', 'mutation', variables);
    },
    GetProject(variables: GetProjectQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetProjectQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProjectQuery>({ document: GetProjectDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetProject', 'query', variables);
    },
    GetProjectModels(variables: GetProjectModelsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetProjectModelsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProjectModelsQuery>({ document: GetProjectModelsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetProjectModels', 'query', variables);
    },
    SearchProjects(variables?: SearchProjectsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SearchProjectsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SearchProjectsQuery>({ document: SearchProjectsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SearchProjects', 'query', variables);
    },
    OnProjectUpdated(variables: OnProjectUpdatedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<OnProjectUpdatedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<OnProjectUpdatedSubscription>({ document: OnProjectUpdatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'OnProjectUpdated', 'subscription', variables);
    },
    OnProjectModelsUpdated(variables: OnProjectModelsUpdatedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<OnProjectModelsUpdatedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<OnProjectModelsUpdatedSubscription>({ document: OnProjectModelsUpdatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'OnProjectModelsUpdated', 'subscription', variables);
    },
    OnProjectVersionsUpdated(variables: OnProjectVersionsUpdatedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<OnProjectVersionsUpdatedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<OnProjectVersionsUpdatedSubscription>({ document: OnProjectVersionsUpdatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'OnProjectVersionsUpdated', 'subscription', variables);
    },
    OnProjectCommentsUpdated(variables: OnProjectCommentsUpdatedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<OnProjectCommentsUpdatedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<OnProjectCommentsUpdatedSubscription>({ document: OnProjectCommentsUpdatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'OnProjectCommentsUpdated', 'subscription', variables);
    },
    GetServerInfo(variables?: GetServerInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetServerInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetServerInfoQuery>({ document: GetServerInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetServerInfo', 'query', variables);
    },
    UpdateActiveUser(variables: UpdateActiveUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateActiveUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateActiveUserMutation>({ document: UpdateActiveUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateActiveUser', 'mutation', variables);
    },
    GetActiveUser(variables?: GetActiveUserQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetActiveUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetActiveUserQuery>({ document: GetActiveUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetActiveUser', 'query', variables);
    },
    GetUser(variables: GetUserQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserQuery>({ document: GetUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetUser', 'query', variables);
    },
    SearchUsers(variables: SearchUsersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SearchUsersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SearchUsersQuery>({ document: SearchUsersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SearchUsers', 'query', variables);
    },
    CreateVersion(variables: CreateVersionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateVersionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateVersionMutation>({ document: CreateVersionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateVersion', 'mutation', variables);
    },
    UpdateVersion(variables: UpdateVersionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateVersionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateVersionMutation>({ document: UpdateVersionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateVersion', 'mutation', variables);
    },
    DeleteVersions(variables: DeleteVersionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteVersionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteVersionsMutation>({ document: DeleteVersionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteVersions', 'mutation', variables);
    },
    MarkVersionReceived(variables: MarkVersionReceivedMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<MarkVersionReceivedMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<MarkVersionReceivedMutation>({ document: MarkVersionReceivedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'MarkVersionReceived', 'mutation', variables);
    },
    GetVersion(variables: GetVersionQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetVersionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetVersionQuery>({ document: GetVersionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetVersion', 'query', variables);
    },
    CreateWebhook(variables: CreateWebhookMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateWebhookMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateWebhookMutation>({ document: CreateWebhookDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateWebhook', 'mutation', variables);
    },
    UpdateWebhook(variables: UpdateWebhookMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWebhookMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWebhookMutation>({ document: UpdateWebhookDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWebhook', 'mutation', variables);
    },
    DeleteWebhook(variables: DeleteWebhookMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteWebhookMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteWebhookMutation>({ document: DeleteWebhookDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteWebhook', 'mutation', variables);
    },
    ListWebhooks(variables: ListWebhooksQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ListWebhooksQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ListWebhooksQuery>({ document: ListWebhooksDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ListWebhooks', 'query', variables);
    },
    CreateWorkspace(variables: CreateWorkspaceMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateWorkspaceMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateWorkspaceMutation>({ document: CreateWorkspaceDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateWorkspace', 'mutation', variables);
    },
    UpdateWorkspace(variables: UpdateWorkspaceMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkspaceMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkspaceMutation>({ document: UpdateWorkspaceDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkspace', 'mutation', variables);
    },
    InviteToWorkspace(variables: InviteToWorkspaceMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<InviteToWorkspaceMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<InviteToWorkspaceMutation>({ document: InviteToWorkspaceDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InviteToWorkspace', 'mutation', variables);
    },
    CreateWorkspaceProject(variables: CreateWorkspaceProjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateWorkspaceProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateWorkspaceProjectMutation>({ document: CreateWorkspaceProjectDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateWorkspaceProject', 'mutation', variables);
    },
    GetWorkspace(variables: GetWorkspaceQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetWorkspaceQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkspaceQuery>({ document: GetWorkspaceDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetWorkspace', 'query', variables);
    },
    ListWorkspaces(variables?: ListWorkspacesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ListWorkspacesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ListWorkspacesQuery>({ document: ListWorkspacesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ListWorkspaces', 'query', variables);
    },
    OnWorkspaceUpdated(variables?: OnWorkspaceUpdatedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<OnWorkspaceUpdatedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<OnWorkspaceUpdatedSubscription>({ document: OnWorkspaceUpdatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'OnWorkspaceUpdated', 'subscription', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
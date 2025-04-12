# Tools

## User Identity Tools

#### `get_user_identity`
**Description**: Retrieve basic information about the authenticated user

**Inputs**:
- `username` (string, required): The username to look up

**Returns**: User identity information as JSON string

#### `get_user_profile`
**Description**: Retrieve a user by username

**Inputs**:
- `username` (string, required): The username to look up

**Returns**: User profile information as JSON string

#### `edit_user_profile`
**Description**: Edit a user's profile data

**Inputs**:
- `username` (string, required): The username to edit
- `name` (string, optional): User's name
- `profile` (string, optional): User's profile text
- `location` (string, optional): User's location
- `home_page` (string, optional): User's homepage URL
- `curr_abbr` (string, optional): Currency code (USD, GBP, EUR, CAD, AUD, JPY, CHF, MXN, BRL, NZD, SEK, ZAR)

**Returns**: Updated user profile as JSON string

## User Collection Tools

#### `get_user_collection_folders`
**Description**: Retrieve a list of folders in a user's collection

**Inputs**:
- `username` (string, required): The username whose collection to access

**Returns**: List of collection folders as JSON string

#### `create_user_collection_folder`
**Description**: Create a new folder in a user's collection

**Inputs**:
- `username` (string, required): The username whose collection to access
- `name` (string, required): The name of the new folder

**Returns**: Created folder information as JSON string

#### `get_user_collection_folder`
**Description**: Retrieve metadata about a folder in a user's collection

**Inputs**:
- `username` (string, required): The username whose collection to access
- `folder_id` (integer, required): The ID of the folder to retrieve

**Returns**: Folder metadata as JSON string

#### `edit_user_collection_folder`
**Description**: Edit a folder in a user's collection

**Inputs**:
- `username` (string, required): The username whose collection to access
- `folder_id` (integer, required): The ID of the folder to edit
- `name` (string, required): The new name for the folder

**Returns**: Updated folder information as JSON string

#### `delete_user_collection_folder`
**Description**: Delete a folder from a user's collection (must be empty)

**Inputs**:
- `username` (string, required): The username whose collection to access
- `folder_id` (integer, required): The ID of the folder to delete

**Returns**: Success status as JSON string

#### `get_user_collection_items`
**Description**: Retrieve a list of items in a user's collection

**Inputs**:
- `username` (string, required): The username whose collection to access
- `folder_id` (integer, required): The ID of the folder to retrieve items from
- `page` (integer, optional): Page number (minimum: 1)
- `per_page` (integer, optional): Items per page (minimum: 1, maximum: 100)
- `sort` (string, optional): Sort field (added, artist, catno, format, label, rating, title, year)
- `sort_order` (string, optional): Sort direction (asc, desc)

**Returns**: List of collection items as JSON string

#### `add_release_to_user_collection_folder`
**Description**: Add a release to a folder in a user's collection

**Inputs**:
- `username` (string, required): The username whose collection to access
- `folder_id` (integer, required): The ID of the folder to add to
- `release_id` (number, required): The ID of the release to add

**Returns**: Added release information as JSON string

#### `delete_release_from_user_collection_folder`
**Description**: Remove a release from a user's collection folder

**Inputs**:
- `username` (string, required): The username whose collection to access
- `folder_id` (integer, required): The ID of the folder to remove from
- `release_id` (number, required): The ID of the release to remove
- `instance_id` (integer, required): The instance ID of the release in the collection

**Returns**: Success status as JSON string

#### `find_release_in_user_collection`
**Description**: Find a release in a user's collection

**Inputs**:
- `username` (string, required): The username whose collection to search
- `release_id` (number, required): The ID of the release to find
- `page` (integer, optional): Page number (minimum: 1)
- `per_page` (integer, optional): Items per page (minimum: 1, maximum: 100)
- `sort_order` (string, optional): Sort direction (asc, desc)

**Returns**: Release information as JSON string

#### `rate_release_in_user_collection`
**Description**: Rate a release in a user's collection

**Inputs**:
- `username` (string, required): The username whose collection to access
- `folder_id` (integer, required): The ID of the folder containing the release
- `release_id` (number, required): The ID of the release to rate
- `instance_id` (integer, required): The instance ID of the release in the collection
- `rating` (integer, required): Rating value (1-5)

**Returns**: Updated rating information as JSON string

#### `move_release_in_user_collection`
**Description**: Move a release in a user's collection to another folder

**Inputs**:
- `username` (string, required): The username whose collection to access
- `folder_id` (integer, required): The ID of the source folder
- `release_id` (number, required): The ID of the release to move
- `instance_id` (integer, required): The instance ID of the release in the collection
- `destination_folder_id` (number, required): The ID of the destination folder

**Returns**: Success status as JSON string

#### `get_user_collection_custom_fields`
**Description**: Retrieve a list of user-defined collection notes fields

**Inputs**:
- `username` (string, required): The username whose collection to access

**Returns**: List of custom fields as JSON string

#### `get_user_collection_value`
**Description**: Returns the minimum, median, and maximum value of a user's collection

**Inputs**:
- `username` (string, required): The username whose collection to access

**Returns**: Collection value statistics as JSON string

## Database Tools

#### `get_release`
**Description**: Get a release

**Inputs**:
- `release_id` (number, required): The ID of the release to get
- `curr_abbr` (string, optional): Currency code

**Returns**: Release information as JSON string

#### `get_release_rating`
**Description**: Get a release's rating for a given user

**Inputs**:
- `release_id` (number, required): The ID of the release
- `username` (string, required): The username to get the rating for

**Returns**: Rating information as JSON string

#### `edit_release_rating`
**Description**: Updates the release's rating for a given user

**Inputs**:
- `release_id` (number, required): The ID of the release
- `username` (string, required): The username to update the rating for
- `rating` (integer, required): Rating value (1-5)

**Returns**: Updated rating information as JSON string

#### `delete_release_rating`
**Description**: Deletes the release's rating for a given user

**Inputs**:
- `release_id` (number, required): The ID of the release
- `username` (string, required): The username to delete the rating for

**Returns**: Success status as JSON string

#### `get_release_community_rating`
**Description**: Get a release's community rating average and count

**Inputs**:
- `release_id` (number, required): The ID of the release

**Returns**: Community rating information as JSON string

#### `get_master_release`
**Description**: Get a master release

**Inputs**:
- `master_id` (number, required): The ID of the master release

**Returns**: Master release information as JSON string

#### `get_artist`
**Description**: Get an artist

**Inputs**:
- `artist_id` (number, required): The ID of the artist

**Returns**: Artist information as JSON string

#### `get_artist_releases`
**Description**: Get an artist's releases

**Inputs**:
- `artist_id` (number, required): The ID of the artist
- `page` (integer, optional): Page number (minimum: 1)
- `per_page` (integer, optional): Items per page (minimum: 1, maximum: 100)
- `sort_order` (string, optional): Sort direction (asc, desc)

**Returns**: List of artist releases as JSON string

#### `get_label`
**Description**: Get a label

**Inputs**:
- `label_id` (number, required): The ID of the label

**Returns**: Label information as JSON string

#### `get_label_releases`
**Description**: Get releases associated with a label

**Inputs**:
- `label_id` (number, required): The ID of the label
- `page` (integer, optional): Page number (minimum: 1)
- `per_page` (integer, optional): Items per page (minimum: 1, maximum: 100)
- `sort_order` (string, optional): Sort direction (asc, desc)

**Returns**: List of releases as JSON string

#### `search`
**Description**: Search the Discogs database

**Inputs**:
- `q` (string, optional): Search query
- `type` (string, optional): Search type (artist, label, master, release)
- `title` (string, optional): Title search
- `release_title` (string, optional): Release title search
- `credit` (string, optional): Credit search
- `artist` (string, optional): Artist search
- `anv` (string, optional): Artist name variation search
- `label` (string, optional): Label search
- `genre` (string, optional): Genre search
- `style` (string, optional): Style search
- `country` (string, optional): Country search
- `year` (string, optional): Year search
- `format` (string, optional): Format search
- `catno` (string, optional): Catalog number search
- `barcode` (string, optional): Barcode search
- `track` (string, optional): Track search
- `submitter` (string, optional): Submitter search
- `contributor` (string, optional): Contributor search
- `page` (integer, optional): Page number (minimum: 1)
- `per_page` (integer, optional): Items per page (minimum: 1, maximum: 100)

**Returns**: Search results as JSON string

#### `get_release_rating_by_user`
**Description**: Retrieves the release's rating for a given user

**Inputs**:
- `release_id` (number, required): The ID of the release
- `username` (string, required): The username to get the rating for

**Returns**: Rating information as JSON string

## User Lists Tools

#### `get_user_lists`
**Description**: Get a user's lists

**Inputs**:
- `username` (string, required): The username whose lists to get

**Returns**: List of user lists as JSON string

#### `get_list`
**Description**: Get a list by ID

**Inputs**:
- `list_id` (number, required): The ID of the list to get

**Returns**: List information as JSON string

## User Wantlist Tools

#### `get_user_wantlist`
**Description**: Returns the list of releases in a user's wantlist

**Inputs**:
- `username` (string, required): The username whose wantlist to get
- `page` (integer, optional): Page number (minimum: 1)
- `per_page` (integer, optional): Items per page (minimum: 1, maximum: 100)
- `sort` (string, optional): Sort field (added, artist, catno, format, label, rating, title, year)
- `sort_order` (string, optional): Sort direction (asc, desc)

**Returns**: List of wantlist items as JSON string

#### `add_to_wantlist`
**Description**: Add a release to a user's wantlist

**Inputs**:
- `username` (string, required): The username whose wantlist to access
- `release_id` (number, required): The ID of the release to add
- `notes` (string, optional): Notes about the release
- `rating` (integer, optional): Rating value (1-5)

**Returns**: Added wantlist item information as JSON string

#### `edit_item_in_wantlist`
**Description**: Edit a release in a user's wantlist

**Inputs**:
- `username` (string, required): The username whose wantlist to access
- `release_id` (number, required): The ID of the release to edit
- `notes` (string, optional): Notes about the release
- `rating` (integer, optional): Rating value (1-5)

**Returns**: Updated wantlist item information as JSON string

#### `delete_item_in_wantlist`
**Description**: Delete a release from a user's wantlist

**Inputs**:
- `username` (string, required): The username whose wantlist to access
- `release_id` (number, required): The ID of the release to delete

**Returns**: Success status as JSON string

## Media Tools

#### `fetch_image`
**Description**: Fetch an image by URL

**Inputs**:
- `url` (string, required): The URL of the image to fetch

**Returns**: Image content

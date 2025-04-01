[
  # Format all relevant files, including seeds and migrations
  inputs: [
    "mix.exs",
    "{config,lib,test}/**/*.{ex,exs}",
    "priv/*/seeds.exs"
  ],

  # Import formatting rules from dependencies
  import_deps: [:ecto, :ecto_sql, :phoenix],

  # Include migrations in the formatting scope
  subdirectories: ["priv/*/migrations"],

  # Remove LiveView-specific formatting (since it's not used)
  plugins: [],

  # Enforce a readable line length
  line_length: 120,

  # Standardize formatting for function calls and macros
  locals_without_parens: [
    # Phoenix Router macros
    plug: 1,
    plug: 2,
    get: 2,
    post: 2,
    put: 2,
    patch: 2,
    delete: 2,
    options: 2,
    head: 2,
    match: 2,

    # Ecto Schema & Changesets
    field: 2,
    field: 3,
    belongs_to: 2,
    belongs_to: 3,
    has_one: 2,
    has_one: 3,
    has_many: 2,
    has_many: 3,
    many_to_many: 2,
    many_to_many: 3,
    embeds_one: 2,
    embeds_one: 3,
    embeds_many: 2,
    embeds_many: 3,

    # Phoenix Context API (optional but helps readability)
    alias: 2,
    alias: 3,
    defcontext: 1,
    defcontext: 2,

    # Custom render helpers (if applicable)
    render: 2,
    render: 3
  ],

  # Ensure trailing commas for better diffs and readability
  force_do_end_blocks: false
]

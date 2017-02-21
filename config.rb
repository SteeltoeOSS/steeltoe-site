###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

activate :sprockets
set :markdown_engine, :redcarpet
set :markdown, :fenced_code_blocks => true, :smartypants => true

# With alternative layout
# page "/path/to/file.html", layout: :otherlayout

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

# General configuration

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

activate :blog do |blog|
  blog.name = "docs"
  blog.prefix = "docs"
  blog.sources = "{title}.html"
  blog.permalink = "{title}.html"
  blog.layout = "documentation"
end

activate :blog do |blog|
  blog.name = "library"
  blog.prefix = "library"
  blog.sources = "{title}.html"
  blog.permalink = "{title}.html"
  blog.layout = "documentation"
end

activate :directory_indexes

###
# Helpers
###

# Methods defined in the helpers block are available in templates
helpers do
  def nav_active(path)
    current_page.url == path ? "active" : ""
  end

  def docs_nav_active(path)
    (current_page.url.include? path) ? "active" : ""
  def docs_nav_active()
    is_docs = current_page.url.include? "docs"
    is_lib = current_page.url.include? "library"
    (is_docs || is_lib) ? "active" : ""
  end
end

# Build-specific configuration
configure :build do
  # Minify CSS on build
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript
end

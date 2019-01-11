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
set :markdown,
      fenced_code_blocks: true,
      smartypants: true,
      with_toc_data: true,
      tables: true,
      xhtml: true

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

activate :directory_indexes

###
# Helpers
###

# Methods defined in the helpers block are available in templates
helpers do
  def sorted_docs(doc_prefix)
    blog(doc_prefix).articles.sort {|a,b| a.data.order <=> b.data.order }
  end

  def nav_active(path)
    current_page.url == path ? "active" : ""
  end

  def is_docs()
    current_page.url.include? "docs/" 
  end

  def is_docs_but_not_overview()
    is_docs() and !current_page.url.end_with? "docs/"
  end

  def docs_nav_active()
    is_lib = current_page.url.include? "library"
    (is_docs() || is_lib) ? "active" : ""
  end

  def table_of_contents(page)
    if config.markdown_engine == :redcarpet && config.markdown[:with_toc_data]
      renderer = Redcarpet::Markdown.new(Redcarpet::Render::HTML_TOC,
                                         fenced_code_blocks: true,
                                         xhtml: true)
      file = ::File.read(page.source_file)
      tocpre = '<nav>'
      tocpost = '</nav>'
      # ignore YAML frontmatter
      file = file.gsub(/^(---\s*\n.*?\n?)^(---\s*$\n?)/m, '')
      file = file.gsub(' & ', ' &amp; ')
      renderer.render(file)
    end
  end

end

# Build-specific configuration
configure :build do
  # Minify CSS on build
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript
end

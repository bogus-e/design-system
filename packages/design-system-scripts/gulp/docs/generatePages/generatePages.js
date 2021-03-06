const addReactDocs = require('./addReactDocs');
const convertMarkdownPages = require('./convertMarkdownPages');
const createRoutes = require('./createRoutes');
const generatePage = require('./generatePage');
const getDocsDistPath = require('../../common/getDocsDistPath');
const kss = require('kss');
const nestSections = require('./nestSections');
const path = require('path');
const processKssSection = require('./processKssSection');
const uniquePages = require('./uniquePages');
const { getDocsDirs } = require('../../common/getDirsToProcess');
const { logTask } = require('../../common/logUtil');
const { REACT_DATA_PATH } = require('../../common/constants');

/**
 * Some KssSection's are nested under section's that don't exist, so we need
 * to first create those top-level sections before we do the nesting
 * @param {Array} kssSections
 * @return {Promise<Array>}
 */
function addTopLevelPages(kssSections) {
  return Promise.resolve(
    [
      {
        header: 'Getting started',
        reference: 'startup',
        sections: [],
        weight: 4,
      },
      {
        header: 'Guidelines',
        reference: 'guidelines',
        sections: [],
        weight: 5,
      },
      {
        header: 'Styles',
        reference: 'styles',
        sections: [],
        weight: 6,
      },
      {
        header: 'Utilities',
        reference: 'utilities',
        sections: [],
        weight: 20,
      },
      {
        header: 'Components',
        reference: 'components',
        sections: [],
        weight: 30,
      },
      {
        header: 'Patterns',
        reference: 'patterns',
        sections: [],
        weight: 40,
      },
    ].concat(kssSections)
  );
}

function generatedPagesCount(resultGroups) {
  let count = 0;

  resultGroups.forEach((results) => {
    if (results) {
      count += results.filter((createdFile) => createdFile).length;
    }
  });

  return count;
}

/**
 * Loop through the nested array of pages and create an HTML file for each one.
 * These HTML pages are what get published as the public documentation website.
 * @return {Promise<Array>}
 */
async function generateDocPages(pages, docsPath, sourceDir, options) {
  const routes = createRoutes(pages);

  const generatedPages = await Promise.all(
    pages.map(async (page) => {
      const created = await generatePage(routes, page, docsPath, sourceDir, options);
      if (page.sections) {
        const results = await Promise.all(
          page.sections.map((subpage) =>
            generatePage(routes, subpage, docsPath, sourceDir, options)
          )
        );
        // return results for generatedPagesCount
        return [created].concat(results);
      }
      return [created];
    })
  );

  return generatedPagesCount(generatedPages);
}

/**
 * Create an HTML file for each KssSection's markup. These are loaded in an
 * embedded in an iframe on documentation pages.
 * @param {Array} kssSections
 * @return {Promise<Array>}
 */
function generateMarkupPages(kssSections, docsPath, sourceDir, options) {
  const pagesWithMarkup = kssSections.filter(
    (page) => page.markup.length > 0 || page.reactExampleSource
  );

  return Promise.all(
    pagesWithMarkup.map((page) => {
      return generatePage(null, page, docsPath, sourceDir, options, true).then((created) => [
        created,
      ]);
    })
  );
}

/**
 * Generate HTML pages from CSS and JS comments and Markdown files. This
 * happens within a chain of promises.
 * @return {Promise}
 */
module.exports = async function generatePages(sourceDir, docsDir, options) {
  logTask('📝 ', 'Generating documentation pages');

  const docsPath = getDocsDistPath(docsDir, options.rootPath);
  const docsDirs = await getDocsDirs(docsDir);

  // Parse Markdown files, and return the data in the same format as a KssSection
  const markdownPagesData = await Promise.all(
    docsDirs.map(async (dir) => {
      return convertMarkdownPages(options.rootPath, dir);
    })
  ).then((dirPages) => dirPages.flat());

  /**
   * Parse KSS documentation blocks in CSS files
   * kss-node.github.io/kss-node/api/master/module-kss.KssSection.html
   * @return {Array} KssSections
   */
  const packages = docsDirs.map((pkg) => path.join(pkg, 'src'));
  const mask = /^(?!.*\.(example|test)).*\.docs\.scss$/; // Parses KSS in .docs.scss files and not in .example.* or .test.* files
  const kssStyleGuide = await kss.traverse(packages, { mask });
  const kssSections = await Promise.all(
    kssStyleGuide.sections().map((kssSection) =>
      // Cleanup and extend the section's properties
      processKssSection(kssSection, options.rootPath)
    )
  );

  // Merge both sets of KssSection objects into a single array of page parts.
  // Also, remove pages with the same URL (so child design systems can override existing pages)
  const pageSections = uniquePages(markdownPagesData.concat(kssSections));

  await addReactDocs(pageSections, REACT_DATA_PATH);
  // Create HTML files for markup examples
  await generateMarkupPages(pageSections, docsPath, sourceDir, options);
  // Add missing top-level pages and connect the page parts to their parent pages
  const pages = await addTopLevelPages(pageSections).then(nestSections);
  // Create HTML files from the pages array
  const generatedPagesCount = await generateDocPages(pages, docsPath, sourceDir, options);

  logTask('📝  ' + generatedPagesCount, `Doc pages added to ${docsDir}`);
};

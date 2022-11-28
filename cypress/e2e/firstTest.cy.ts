describe('Test with backend', () => {
  beforeEach('login to the app', () => {
    cy.intercept(
      { method: 'GET', path: 'tags' },
      { fixture: 'tags.json' },
    );
    cy.loginToApplication();
  });

  it('verify correct request and response', () => {
    const title = `This is TITLE! (${new Date().toLocaleString()})`;
    cy.intercept('POST', 'https://conduit.productionready.io/api/articles/').as('postArticles');

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type(title);
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the article');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles').then((xhr: any) => {
      expect(xhr.response.statusCode).to.equal(307);
      expect(xhr.request.body.article).to.eql({
        title,
        description: 'This is a description',
        body: 'This is a body of the article',
        tagList: [],
      });
    });
  });

  it.skip('intercepting and modifying the request and response', () => {
    cy.intercept({ method: 'POST', path: 'articles' }, (req: any) => {
      req.body.article.description += ' (MODIFIED)';
    }).as('postArticles');

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('This is TITLE!');
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the article');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles').then((xhr: any) => {
      expect(xhr.response.statusCode).to.equal(307);
      expect(xhr.request.body.article).to.eql({
        title: 'This is TITLE!',
        description: 'This is a description (MODIFIED)',
        body: 'This is a body of the article',
        tagList: [],
      });
    });
  });

  it('verify popular tags are displayed', { retries: 3 }, () => {
    cy.get('.tag-list')
      .should('contain', 'cypress')
      .and('contain', 'automation')
      .and('contain', 'testing');
  });

  it.skip('DELETE', () => {
    function remove() {
      cy.contains('Global Feed').click();
      // cy.contains('.page-link', '1').click();
      cy.contains('.author', 'CY Tester')
        .closest('.article-preview')
        .find('.preview-link')
        .click();
      cy.contains('Delete Article').click();
    }

    Array(10).fill(true).forEach(remove);
  });

  it('verify global feed likes count', () => {
    cy.intercept('GET', 'https://conduit.productionready.io/api/articles/feed*', { articles: [], articlesCount: 0 });
    cy.intercept('GET', `${Cypress.env('apiUrl')}/api/articles?*`, { fixture: 'articles.json' });

    cy.contains('Global Feed').click();
    cy.get('app-article-list button').then(heartList => {
      expect(heartList[0]).to.contain('1');
      expect(heartList[1]).to.contain('5');
    });

    cy.fixture('articles.json').then((file: any) => {
      const [, article] = file.articles;
      article.favoritesCount = 6;

      cy.intercept('POST', `${Cypress.env('apiUrl')}/api/articles/${article.slug}/favorite`, file);
    });

    cy.get('app-article-list button').eq(1).click().should('contain', '6');
  });

  it('delete a new article in a global feed', () => {
    const title = `Request from API WS (${new Date().toLocaleString()})`;
    const articleBody = {
      article: {
        title,
        description: 'API testing is easy',
        body: 'React is cool',
        tagList: [],
      },
    };

    cy.get('@token')
      .then((token: any) => {
        cy.request({
          headers: {
            Authorization: `Token ${token}`,
          },
          method: 'POST',
          url: 'https://conduit.productionready.io/api/articles',
          body: articleBody,
        }).then(response => {
          expect(response.status).to.equal(200);
        });

        cy.contains('Global Feed').click();
        cy.get('.article-preview').first().click();
        cy.get('.article-actions').contains('Delete Article').click();

        cy.request({
          headers: {
            Authorization: `Token ${token}`,
          },
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/api/articles?limit=10&offset=0`,
        })
          .its('body')
          .then(({ articles: [article] }) => {
            expect(article.title).to.not.equal(articleBody.article.title);
          });
      });
  });
});

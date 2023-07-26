/// <reference types="cypress"/>

describe("test with backend", () => {
  beforeEach("Login to the App", () => {
    cy.intercept("GET", "https://api.realworld.io/api/tags", {
      fixture: "tags.json", // mock the response data -> stubbed = true. mock indirectly -> go to fixtures folder
    });
    cy.loginToApplication();
  });

  it("verify correct request and response", () => {
    cy.log("We logged in !!!");

    cy.intercept("POST", "https://api.realworld.io/api/articles/").as(
      "postArticles"
    ); // listen the API and save the data on postArticles
    // Stubbed mean did we provide more response or not

    cy.contains("New Article").click();
    cy.get('[formcontrolname="title"]').type("This s");
    cy.get('[formcontrolname="description"]').type("This is the description");
    cy.get('[formcontrolname="body"]').type("This is a body of the article");
    cy.contains("Publish Article").click();

    // cy.get("@postArticles")

    cy.wait("@postArticles").then((xhr) => {
      // wait api completed
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(201);
      expect(xhr.request.body.article.body).to.equal(
        "This is a body of the article"
      );
      expect(xhr.response.body.article.description).to.equal(
        "This is the description"
      );
    });
  });

  it("verify popular tags are displayed", () => {
    cy.log("we logged in");
    cy.get(".tag-list")
      .should("contain", "cypress")
      .and("contain", "automation")
      .and("contain", "testing");
  });

  it.only("verify global feed like count", () => {
    cy.intercept("GET", "https://api.realworld.io/api/articles/feed*", {
      //* mean any value is match
      articles: [],
      articlesCount: 0,
    }); //mock directly

    cy.intercept("GET", "https://api.realworld.io/api/articles*", {
      fixture: "articles.json",
    }); //mock directly

    cy.get("app-article-list button").then((heartList) => {
      console.log("heartList", heartList[0]);
      expect(heartList[0]).to.contain("1");
      expect(heartList[1]).to.contain("50");
    });

    cy.fixture("articles").then((file) => {
      //read this file. default, find .json
      const articleLink = file.articles[1].slug;
      file.articles[1].favoritesCount = 51;

      cy.intercept(
        "POST",
        `https://api.realworld.io/api/articles/${articleLink}/favorite`,
        file
      );
      cy.get("app-article-list button").eq(1).click().should("contain", "51");
    });
  });
});

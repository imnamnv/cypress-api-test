/// <reference types="cypress"/>

describe("test with backend", () => {
  beforeEach("Login to the App", () => {
    // 1
    // cy.intercept("GET", "**/tags", {
    //   fixture: "tags.json", // mock the response data -> stubbed = true. mock indirectly -> go to fixtures folder
    // });

    // 2
    cy.intercept({ method: "get", path: "tags" }, { fixture: "tags.json" }); // listen a part of path: tags
    cy.loginToApplication();
  });

  it("verify correct request and response", () => {
    cy.log("We logged in !!!");

    cy.intercept("POST", "https://api.realworld.io/api/articles/").as(
      "postArticles"
    ); // listen the API and save the data on postArticles
    // Stubbed mean did we provide more response or not

    cy.contains("New Article").click();
    cy.get('[formcontrolname="title"]').type("This sssxxxs 2"); // title must unique
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

  it("intercepting and modifying the request and response", () => {
    cy.log("We logged in !!!");

    // change req
    // cy.intercept("POST", "**/articles", (req) => {
    //   req.body.article.description = "This is the description 2";
    // }).as("postArticles");

    // change res
    cy.intercept("POST", "**/articles", (req) => {
      req.reply((res) => {
        expect(res.body.article.description).to.equal(
          "This is the description"
        );
        res.body.article.description = "This is the description 2";
      });
    }).as("postArticles");

    cy.contains("New Article").click();
    cy.get('[formcontrolname="title"]').type("Thisexxwxx");
    cy.get('[formcontrolname="description"]').type("This is the description");
    cy.get('[formcontrolname="body"]').type("This is a body of the article");
    cy.contains("Publish Article").click();

    cy.wait("@postArticles");

    cy.get("@postArticles").then((xhr) => {
      // wait api completed
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(201);
      expect(xhr.request.body.article.body).to.equal(
        "This is a body of the article"
      );
      expect(xhr.response.body.article.description).to.equal(
        "This is the description 2"
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

  it("verify global feed like count", () => {
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

  it("WAY 1 LOGIN: delete a new article in a global feed", () => {
    cy.intercept("get", "https://api.realworld.io/api/articles*").as(
      "getArticles"
    );

    const user = {
      user: {
        email: "artem.bondar16@gmail.com",
        password: "CypressTest1",
      },
    };

    const bodyRequest = {
      article: {
        tagList: [],
        title: "Request from API from Nam",
        description: "API testing is easy",
        body: "Angular is cool",
      },
    };

    cy.request("POST", "https://api.realworld.io/api/users/login", user)
      .its("body")
      .then((body) => {
        const token = body.user.token;

        cy.request({
          url: "https://api.realworld.io/api/articles/",
          headers: {
            Authorization: "Token " + token,
          },
          method: "POST",
          body: bodyRequest,
        }).then((response) => {
          console.log("response", response);
          expect(response.status).to.equal(201);
        });

        cy.contains("Global Feed").click();

        cy.wait("@getArticles").then((xhr) => {
          cy.get(".article-preview").first().click();
          cy.get(".article-actions").contains("Delete Article").click();
        });

        cy.request({
          url: "https://api.realworld.io/api/articles?limit=10&offset=0",
          headers: {
            Authorization: "Token " + token,
          },
          method: "GET",
        })
          .its("body")
          .then((body) => {
            console.log("body", body);
            expect(body.articles[0].title).not.equal(
              "Request from API from Nam"
            );
          });
      });
  });

  it.only("WAY 2 LOGIN: delete a new article in a global feed", () => {
    cy.intercept("get", "https://api.realworld.io/api/articles*").as(
      "getArticles"
    );

    const user = {
      user: {
        email: "artem.bondar16@gmail.com",
        password: "CypressTest1",
      },
    };

    const bodyRequest = {
      article: {
        tagList: [],
        title: "Request from API from Nam",
        description: "API testing is easy",
        body: "Angular is cool",
      },
    };

    cy.get("@token").then((token) => {
      cy.request({
        url: "https://api.realworld.io/api/articles/",
        headers: {
          Authorization: "Token " + token,
        },
        method: "POST",
        body: bodyRequest,
      }).then((response) => {
        console.log("response", response);
        expect(response.status).to.equal(201);
      });

      cy.contains("Global Feed").click();

      cy.wait("@getArticles").then((xhr) => {
        cy.get(".article-preview").first().click();
        cy.get(".article-actions").contains("Delete Article").click();
      });

      cy.request({
        url: "https://api.realworld.io/api/articles?limit=10&offset=0",
        headers: {
          Authorization: "Token " + token,
        },
        method: "GET",
      })
        .its("body")
        .then((body) => {
          console.log("body", body);
          expect(body.articles[0].title).not.equal("Request from API from Nam");
        });
    });
  });
});

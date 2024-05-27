# Transmit

## Introduction

### The Project

The project aims to design and develop a TSN (Tailored Social Network) platform that offers advanced functionalities beyond traditional platforms like Facebook. The platform must be based on a graph structure, inspired by the FOAF (Friend of a Friend) Ontology, enabling users to connect, interact, and share content in a more personalized and intuitive manner.

### See it live

We recently enabled GA (General Availability) of our project, making it accessible online, by everyone.
You can see it here : https://transmit-project.vercel.app/about

### Local Installation

Run `pnpm install` to get started and install all dependencies.
If you don't have `pnpm` installed, simply run `npm install -g pnpm`.

Run `pnpm dev` for a dev server ; then, navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files. You don't need to run anything else in order to get started ; our project completely relies on on-device-computing making it backendless, and the database is hosted online.

## Project Features

### Feed

#### Recommended posts

Posts are ranked based on User behaviour, User friendship, User tags and date.
For more information : download the [algorithm_explanation.pdf](algorithm_explanation.pdf).

#### Post new content

Yes, networking is cool, but a network is not here just to exist. It is here for you to share content with your relations. A social network without the ability to share content is useless, thus Transmit allows you to share your opinion, eventually joining an image to it.

#### Comments

What is interesting with humans is that everybody has different opinions. And from these differences arises interesting conversations. However conversations need an appropriate support to exist, which we believed to be a comment section under each main post. Comments are also updated in realtime.

#### Like content

As writing a "i love this content" comment for each post you like is not the best user experience, we chose a seamless approach by implement a small "Like" button to show your love for the content you appreciate.

### Explore

#### Force graph

The graph displayed is powered by the [d3 library](https://d3js.org/) ; we chose to use the [force graph](https://observablehq.com/@d3/disjoint-force-directed-graph/2?intent=fork) because it's perfect to represent a network with nodes and directed links.

The `force-graph` component is solely used for rendering and is not doing any logic ; it's all within the `foaf-service`. 

The Algorithm : 
When the service is initialized, we take the current user id and put it in a stack. Then, we pop it to query all the relationships this user have. For all his friends, we add them in an adjacency list ; this structure have a user as key and the values are represented by a list containing all his friends. Then all the queried friends are added into the stack and we loop continue while the stack is not empty. 

The algorithm may query all users in the database if they are all linked by at least one person. So, when do we stop? We decided to add a feature to address this specific problem, which we've called "depth control". When we start the first iteration of the loop with the connected user, we add it to the adjacency list with an attribute called "depth" initialized at 0. In this way, all their friends have a depth of their friend, plus 1; when they are registered in the adjacency list, they also have the depth attribute. With that system, we can give a maximum depth as an argument and do not query friends of user that exceed the maximum depth, resulting in a stack dwindling to nothing.


#### Side Peek
The side peek view is a panel that displays the last user we clicked on. A request is made to get user data based on its id and then displayed in a friendly way. However, the number of followers displayed is not accurate. It is relative to the current depth of the graph. For instance, if the graph is set with a depth of 1, we only have our friends, so our number of followers is zero. But the bigger the depth becomes, the more accurate the number of followers is.

#### Recommendation users

The user recommendation is done using 2 methods : recommendation based on tags and based on friends of friends.
For more information : download the [algorithm_explanation.pdf](algorithm_explanation.pdf).

### Account Control

#### Modify basics information
We provide a basic interface to modify user information. The forms are automatically updated when the user click outsides, meaning the data is always up to date. 

#### Manage relations

Relations are an essential concept in Transmit. This is why having an easy access to manage them is required. Friend breakups may appear in many occasions, so removing a friendship link should be done quickly, as well as removing followers that are not wanted anymore. 

#### Manage posted content

Ideas an opinions come and go. You might say something one day and regret saying it a few days later. Same goes for posts published online, sometimes you do not want some content to be visible anymore. Thus, a content management panel was required to review ones own posts and delete them if the wil is present.  

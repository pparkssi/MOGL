
# 커미터 가이드

MoGL 멤버로 추가된 커미터만이 모든 변경 사항을 반영할 수 있습니다.

변경 사항을 반영하기 전에 반드시 아래의 [Guideline](#guideline)을 확인해 주세요.

# Guideline

* 소스 코드 작성은 항상 최신의 `dev` branch를 사용해 주세요. `master` branch는 소스 코드 작성에 사용되지 않습니다.

* 문서 작성은 항상 최신의 `master` branch를 사용해 주세요.

* `gh-pages` branch는 웹에서 확인 용도로 자유롭게 변경할 수 있습니다.

    다만, 버전 넘버링이 있는 폴더는 `Release`, `README` 등에서 사용되므로 변경하지 않아야 합니다.
    
    > 예) showcase.0.1

* 변경전에 `Issues` 에 변경 예정인 작업를 등록해 주세요.
    
    같은 작업을 여러 커미터가 진행하는 일을 방지할 수 있고, 다른 커미터가 진행 중인 작업에 도움을 줄 수도 있습니다.
    
    `Issue` 등록시에는 `Labels`, `Milestone`, `Assignee` 를 지정해 주세요.

* 변경이 완료되면 `Issue`를 `close`해 주세요.

    마일스톤의 `Issue`들이 완료되면 해당 마일스톤의 버전이 배포됩니다.